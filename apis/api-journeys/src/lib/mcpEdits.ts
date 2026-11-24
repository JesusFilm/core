import { randomUUID } from 'node:crypto'

import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { Prisma, type PrismaClient } from '@core/prisma/journeys/client'
import {
  type HistoryResult,
  type OperationReceipt,
  type OperationResult,
  type TypographyCommand,
  canonicalFingerprint,
  isStructureCommand,
  operationFailure,
  operationReceipt,
  operationResult,
  privateOperationErrorCodes
} from '@core/yoga/mcp/editContract'
import {
  type PresentationCommand,
  createdInverse
} from '@core/yoga/mcp/presentationContract'
import {
  assertRequestInputSize,
  assertStructuredResultSize,
  boundedJson,
  fingerprint,
  internalSignature,
  isContentWrite,
  maxTransportBytes,
  postJson,
  readTransportRequest,
  safeReadError,
  sameSecret,
  verifyReadCredential
} from '@core/yoga/mcp/readContract'

import { Action, journeyAcl } from '../schema/journey/journey.acl'

import {
  lockDraftJourneyRevision,
  readJourneyRevision
} from './journeyRevision/journeyRevision'
import {
  type ContentInverse,
  type ContentPlan,
  createdState,
  planContent
} from './mcpContent'
import { prepareCardChatGate } from './mcpContentFeatures'
import {
  cleanupJourneyEdits,
  editDatabaseTime,
  reconcileJourneyEdits
} from './mcpEditsStore'
import {
  describeHistory,
  hasStructureHistory,
  historyEntries,
  planHistory
} from './mcpHistory'
import { validateMediaPlan } from './mcpMedia'
import { hasMediaCommands, resolveEditMedia } from './mcpMediaClient'
import type { JourneyReadsConfig } from './mcpReads'
import { executeStructure, planStructure } from './mcpStructure'
import { planStructureHistory } from './mcpStructureHistory'
import type { StructureInverse, StructurePlan } from './mcpStructureState'

export type EditCheckpoint =
  | 'execution_prepared'
  | 'before_accept'
  | 'after_accept'
  | 'after_child'
  | 'after_content'
  | 'after_revision'
  | 'after_history'
  | 'after_receipt'
  | 'after_outbox'
  | 'before_commit'
  | 'after_commit'
export interface EditContext {
  permitId: string
  executorId: string
  operationId?: string
}
/** Controlled fault/clock adapters are injected by owning-service tests only. */
export interface JourneyEditHooks {
  checkpoint?: (point: EditCheckpoint, context: EditContext) => Promise<void>
  now?: () => Date
  canEditChat?: (userId: string) => Promise<boolean>
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function editError(error: unknown): string {
  if (error && typeof error === 'object' && 'extensions' in error) {
    const result = z
      .object({ code: z.enum(['REVISION_CONFLICT', 'NOT_EDITABLE']) })
      .safeParse(error.extensions)
    if (result.success) return result.data.code
  }
  return safeReadError(error)
}

/** Execution/recovery lock order: execution, namespace, journey, owned blocks.
 * Coordinator preparation captures gates before authoritative ACL reads. Final
 * acceptance precedes the content transaction. Its local fences and current ACLs
 * are checked again under owning locks before this bounded action commits.
 */
export function createJourneyEditHandler(
  config: JourneyReadsConfig,
  db: PrismaClient,
  hooks: JourneyEditHooks = {}
) {
  const authority = (action: string, body: unknown) =>
    postJson(
      new URL(`/internal/reads/${action}`, config.authorityUrl).href,
      body,
      `Bearer ${config.authoritySecret}`
    )
  const handler = async (request: Request): Promise<Response> => {
    let executionId: string | undefined
    let pendingPermit: string | undefined
    let verifiedCredential: string | undefined
    try {
      if (
        request.method !== 'POST' ||
        request.headers.has('authorization') ||
        request.headers.has('interop-token')
      )
        throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const credential = request.headers.get('x-mcp-context') ?? ''
      const claims = verifyReadCredential(credential, config)
      verifiedCredential = credential
      const raw = await boundedJson(
        new Response(request.body),
        maxTransportBytes
      )
      const body = readTransportRequest.parse(raw)
      assertRequestInputSize(body.request)
      if (
        ![
          'journey_edit',
          'journey_operation_get',
          'journey_history',
          'journey_undo',
          'journey_redo'
        ].includes(body.request.tool) ||
        !sameSecret(
          request.headers.get('x-mcp-signature') ?? '',
          internalSignature(
            credential,
            JSON.stringify(body),
            config.internalSecret
          )
        ) ||
        fingerprint(body.request) !== claims.requestHash
      )
        throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const operation = body.request
      if (hasMediaCommands(operation) && !config.media)
        throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const usesMedia = Boolean(
        config.media &&
          (hasMediaCommands(operation) ||
            (operation.tool === 'journey_edit' &&
              operation.input.commands.some(
                (command) =>
                  command.type === 'step_duplicate' ||
                  command.type === 'block_duplicate'
              )) ||
            operation.tool === 'journey_undo' ||
            operation.tool === 'journey_redo')
      )
      const payloadHash = canonicalFingerprint(
        operation.tool === 'journey_edit'
          ? operation.input
          : { tool: operation.tool, input: operation.input }
      )
      if (
        operation.tool !== 'journey_edit' &&
        operation.tool !== 'journey_operation_get' &&
        operation.tool !== 'journey_history' &&
        operation.tool !== 'journey_undo' &&
        operation.tool !== 'journey_redo'
      )
        throw new Error('VALIDATION_FAILED')
      if (
        !claims.journeyIds.includes(operation.input.journeyId) ||
        (isContentWrite(operation.tool) &&
          (claims.mode !== 'edit' || claims.scope !== 'journeys:edit'))
      )
        throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const resource = await db.journey.findUnique({
        where: { id: operation.input.journeyId, deletedAt: null },
        select: { id: true, teamId: true }
      })
      if (!resource) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const executorId = randomUUID()
      const { permitId } = z.object({ permitId: z.string().uuid() }).parse(
        await authority('prepare', {
          credential,
          executorId: body.stage === 'read' ? executorId : claims.executorId,
          stage: body.stage,
          resources: [{ journeyId: resource.id, teamId: resource.teamId }],
          media: usesMedia,
          outputHash: body.stage === 'output' ? body.outputHash : undefined
        })
      )
      pendingPermit = permitId
      const context: EditContext = { permitId, executorId }
      if (body.stage === 'read') {
        await db.mcpEditExecution.create({
          data: {
            id: permitId,
            executorId,
            connectionId: claims.connectionId,
            requestId: claims.requestId,
            requestHash: claims.requestHash,
            responseExpiresAt: new Date(claims.expiresAt)
          }
        })
        executionId = permitId
      }
      await db.mcpEditNamespace.upsert({
        where: { id: claims.connectionId },
        create: {
          id: claims.connectionId,
          actorId: claims.subject,
          clientId: claims.clientId
        },
        update: {}
      })
      await hooks.checkpoint?.('execution_prepared', context)
      const requiresChat =
        operation.tool === 'journey_edit'
          ? operation.input.commands.some(
              (command) => command.type === 'card_chat_set'
            )
          : operation.tool === 'journey_undo' ||
            operation.tool === 'journey_redo'
      const canEditChat = hooks.canEditChat
        ? () => hooks.canEditChat!(claims.subject)
        : requiresChat && body.stage === 'read'
          ? await prepareCardChatGate(claims.subject)
          : async () => false
      const authorizedJourney = async (tx: Prisma.TransactionClient) => {
        const profile = await tx.journeyProfile.findUnique({
          where: { userId: claims.subject }
        })
        const journey = await tx.journey.findUnique({
          where: {
            id: resource.id,
            deletedAt: null,
            archivedAt: null,
            trashedAt: null
          },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        })
        if (
          !profile?.acceptedTermsAt ||
          !journey ||
          journey.teamId !== resource.teamId ||
          journey.template === true ||
          journey.templateSite === true ||
          !['draft', 'published'].includes(journey.status) ||
          !journeyAcl(Action.Read, journey, {
            id: claims.subject
          } as Parameters<typeof journeyAcl>[2])
        )
          throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        return journey
      }
      const authorized = await authorizedJourney(db)
      const retained =
        usesMedia && 'idempotencyKey' in operation.input
          ? await db.mcpEditOperation.findFirst({
              where: {
                namespaceId: claims.connectionId,
                journeyId: authorized.id,
                idempotencyKey: operation.input.idempotencyKey
              }
            })
          : null
      const mediaProjection =
        usesMedia && body.stage === 'read' && !retained
          ? await resolveEditMedia(
              config.media!,
              credential,
              permitId,
              operation,
              db,
              claims.connectionId,
              claims.consentHistoryGeneration,
              { website: authorized.website, languageId: authorized.languageId }
            )
          : undefined
      let needsChatGate = false
      const execute = (
        preflight: boolean
      ): Promise<OperationResult | HistoryResult | null> =>
        db.$transaction(
          async (tx) => {
            if (executionId) {
              await tx.$queryRaw`SELECT id FROM "McpEditExecution" WHERE id = ${executionId} FOR UPDATE`
              const execution = await tx.mcpEditExecution.findUniqueOrThrow({
                where: { id: executionId }
              })
              if (execution.status !== 'prepared')
                throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
            }
            await tx.$queryRaw`SELECT id FROM "McpEditNamespace" WHERE id = ${claims.connectionId} FOR UPDATE`
            const namespace = await tx.mcpEditNamespace.findUniqueOrThrow({
              where: { id: claims.connectionId }
            })
            const responseWitness =
              body.stage === 'output'
                ? await tx.mcpEditExecution.findFirst({
                    where: {
                      requestId: claims.requestId,
                      requestHash: claims.requestHash,
                      connectionId: claims.connectionId,
                      status: 'settled',
                      failureCode: { not: null }
                    }
                  })
                : null
            if (
              namespace.retiredAt ||
              namespace.actorId !== claims.subject ||
              namespace.clientId !== claims.clientId
            )
              throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
            await tx.$queryRaw`SELECT id FROM "Journey" WHERE id = ${resource.id} FOR NO KEY UPDATE`
            const journey = await authorizedJourney(tx)
            const prior =
              operation.tool === 'journey_history'
                ? null
                : await tx.mcpEditOperation.findFirst({
                    where: {
                      namespaceId: namespace.id,
                      ...(operation.tool !== 'journey_operation_get'
                        ? { idempotencyKey: operation.input.idempotencyKey }
                        : operation.input.operationId
                          ? { id: operation.input.operationId }
                          : { idempotencyKey: operation.input.idempotencyKey })
                    }
                  })
            const settle = async (status: 'committed' | 'settled') => {
              if (preflight || !executionId) return
              await tx.mcpEditExecution.update({
                where: { id: executionId },
                data: {
                  status,
                  operationId: context.operationId,
                  completedAt: await editDatabaseTime(tx, hooks.now)
                }
              })
            }
            const reject = async (
              code: (typeof privateOperationErrorCodes)[number]
            ) => {
              if (!executionId) throw new Error(code)
              await tx.mcpEditExecution.update({
                where: { id: executionId },
                data: {
                  status: 'settled',
                  failureCode: code,
                  completedAt: await editDatabaseTime(tx, hooks.now)
                }
              })
              return operationFailure.parse({
                contractVersion: '1',
                kind: 'operation_failure',
                code
              })
            }
            if (
              (operation.tool === 'journey_undo' ||
                operation.tool === 'journey_redo') &&
              !responseWitness &&
              journey.status !== 'draft'
            )
              return reject('NOT_EDITABLE')
            if (operation.tool === 'journey_history' && !responseWitness) {
              if (journey.status !== 'draft') return reject('NOT_EDITABLE')
              const entries = await historyEntries(
                tx,
                namespace.id,
                journey.id,
                claims.consentHistoryGeneration
              )
              const description = describeHistory(
                journey.id,
                await readJourneyRevision(tx, journey.id),
                entries,
                Boolean(
                  config.editsEnabled &&
                    claims.mode === 'edit' &&
                    journeyAcl(Action.Update, journey, {
                      id: claims.subject
                    } as Parameters<typeof journeyAcl>[2])
                )
              )
              if (
                body.stage === 'output' &&
                fingerprint(description) !== body.dataHash
              )
                throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
              await settle('settled')
              return description
            }
            if (
              prior ||
              operation.tool === 'journey_operation_get' ||
              body.stage === 'output'
            ) {
              const now = await editDatabaseTime(tx, hooks.now)
              let retained: OperationResult
              if (responseWitness) {
                retained = operationFailure.parse({
                  contractVersion: '1',
                  kind: 'operation_failure',
                  code: responseWitness.failureCode
                })
              } else if (!prior || prior.journeyId !== journey.id) {
                retained = {
                  contractVersion: '1',
                  kind: 'operation_failure',
                  code: 'RESULT_UNAVAILABLE'
                }
              } else if (
                isContentWrite(operation.tool) &&
                prior.payloadHash !== payloadHash
              ) {
                retained = {
                  contractVersion: '1',
                  kind: 'operation_failure',
                  code: 'IDEMPOTENCY_KEY_REUSED'
                }
              } else if (
                prior.resultExpiresAt <= now ||
                prior.result === null
              ) {
                retained = {
                  contractVersion: '1',
                  kind: 'operation_failure',
                  code: 'RESULT_EXPIRED'
                }
              } else {
                retained = operationReceipt.parse(prior.result)
              }
              context.operationId = prior?.id
              if (
                body.stage === 'output' &&
                fingerprint(retained) !== body.dataHash
              )
                throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
              if (
                preflight &&
                executionId &&
                retained.kind === 'operation_failure'
              )
                return reject(retained.code)
              await settle('settled')
              return operationResult.parse(retained)
            }
            if (!config.editsEnabled)
              throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
            if (
              !journeyAcl(Action.Update, journey, {
                id: claims.subject
              } as Parameters<typeof journeyAcl>[2])
            )
              throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
            if (operation.tool === 'journey_history')
              throw new Error('VALIDATION_FAILED')
            try {
              await lockDraftJourneyRevision(
                tx,
                journey.id,
                operation.input.expectedRevision
              )
            } catch (error) {
              if (!(error instanceof GraphQLError)) throw error
              const failure = z
                .enum(['REVISION_CONFLICT', 'NOT_EDITABLE'])
                .safeParse(error.extensions.code)
              if (!failure.success) throw error
              return reject(failure.data)
            }
            const changes: Array<ContentInverse | StructureInverse> = []
            let structuralPlan: StructurePlan | undefined
            const plans: ContentPlan[] = []
            let idMap: Record<string, string> = {}
            let restoredEntry:
              | Awaited<ReturnType<typeof historyEntries>>[number]
              | undefined
            if (
              operation.tool === 'journey_undo' ||
              operation.tool === 'journey_redo'
            ) {
              const entries = await historyEntries(
                tx,
                namespace.id,
                journey.id,
                claims.consentHistoryGeneration
              )
              const direction =
                operation.tool === 'journey_undo' ? 'undo' : 'redo'
              restoredEntry =
                direction === 'undo'
                  ? [...entries].reverse().find((entry) => !entry.undone)
                  : entries.find((entry) => entry.undone)
              if (
                !restoredEntry ||
                !entries.some((entry) => entry.id === operation.input.entryId)
              )
                return reject('HISTORY_UNAVAILABLE')
              if (restoredEntry.id !== operation.input.entryId)
                return reject('HISTORY_CONFLICT')
              if (
                !config.media &&
                Array.isArray(restoredEntry.changes) &&
                restoredEntry.changes.some(
                  (change) =>
                    change &&
                    typeof change === 'object' &&
                    'media' in change &&
                    change.media === true
                )
              )
                throw new Error('ACCESS_DENIED_OR_NOT_FOUND')

              try {
                if (hasStructureHistory(restoredEntry.changes)) {
                  structuralPlan = await planStructureHistory(
                    tx,
                    journey,
                    restoredEntry.changes,
                    direction,
                    canEditChat
                  )
                } else {
                  plans.push(
                    ...(await planHistory(
                      tx,
                      journey.id,
                      restoredEntry.changes,
                      direction,
                      canEditChat
                    ))
                  )
                }
              } catch (error) {
                if (
                  error instanceof Error &&
                  (error.message === 'HISTORY_CONFLICT' ||
                    error.message === 'HISTORY_UNAVAILABLE')
                )
                  return reject(error.message)
                throw error
              }
            }
            if (operation.tool === 'journey_edit') {
              const commands = operation.input.commands
              if (
                commands.every(
                  (
                    command
                  ): command is PresentationCommand | TypographyCommand =>
                    !isStructureCommand(command)
                )
              ) {
                const planned = await planContent(
                  tx,
                  journey.id,
                  commands,
                  canEditChat
                )
                plans.push(...planned.plans)
                idMap = planned.idMap
              } else {
                try {
                  structuralPlan = await planStructure(
                    tx,
                    journey,
                    commands,
                    mediaProjection,
                    canEditChat
                  )
                } catch (error) {
                  if (
                    error instanceof Error &&
                    error.message === 'LIMIT_EXCEEDED'
                  )
                    return reject('LIMIT_EXCEEDED')
                  throw error
                }
              }
            }
            if (structuralPlan) {
              if (
                usesMedia ||
                operation.tool === 'journey_undo' ||
                operation.tool === 'journey_redo'
              )
                await validateMediaPlan(tx, structuralPlan, mediaProjection)
              // Make room for the fixed receipt envelope before accepting a
              // plan that may report many incoming links and copied IDs.
              try {
                assertStructuredResultSize({
                  changedFields: structuralPlan.changedFields,
                  idMap: structuralPlan.idMap,
                  duplicateIdMap: structuralPlan.duplicateIdMap,
                  duplicateMaps: structuralPlan.duplicateMaps,
                  affectedLinks: structuralPlan.affectedLinks,
                  warnings: structuralPlan.warnings,
                  receiptEnvelope: ' '.repeat(4096)
                })
              } catch (error) {
                if (
                  error instanceof Error &&
                  error.message === 'LIMIT_EXCEEDED'
                )
                  return reject('LIMIT_EXCEEDED')
                throw error
              }
            }
            needsChatGate =
              structuralPlan?.requiresChat === true ||
              plans.some((plan) => plan.gate === 'aiChatEditor') ||
              (operation.tool === 'journey_edit' && requiresChat)
            context.operationId ??= randomUUID()
            if (preflight) return null
            if (needsChatGate && !(await canEditChat()))
              throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
            if (structuralPlan) {
              await executeStructure(tx, structuralPlan, async () => {
                await hooks.checkpoint?.('after_child', context)
              })
              changes.push(...structuralPlan.changes)
            }
            for (const plan of plans) {
              if (plan.create) {
                await tx.block.create({ data: plan.create })
                if (plan.create.typename === 'IconBlock')
                  await hooks.checkpoint?.('after_child', context)
              } else if (plan.patch) {
                await tx.block.update({
                  where: { id: plan.blockId },
                  data: plan.patch
                })
              }
              if (plan.inverse) changes.push(plan.inverse)
              if (plan.captureCreated) {
                const blocks = []
                for (const id of plan.captureCreated.ids) {
                  const block = await tx.block.findUniqueOrThrow({
                    where: { id, journeyId: journey.id }
                  })
                  blocks.push({ id, state: createdState(block) })
                }
                changes.push(
                  createdInverse.parse({
                    type: 'content_created',
                    parent: plan.captureCreated.parent,
                    blocks
                  })
                )
              }
            }
            await hooks.checkpoint?.('after_content', context)
            const revision = await readJourneyRevision(tx, journey.id)
            await hooks.checkpoint?.('after_revision', context)
            const completedAt = await editDatabaseTime(tx, hooks.now)
            const historyId =
              restoredEntry?.id ?? (changes.length ? randomUUID() : null)
            const effectIds =
              plans.length || structuralPlan?.objectCount ? [randomUUID()] : []
            const changedFields = new Map<
              string,
              Set<OperationReceipt['changedFields'][number]['fields'][number]>
            >()
            for (const plan of plans) {
              const fields = changedFields.get(plan.blockId) ?? new Set()
              plan.fields.forEach((field) => fields.add(field))
              changedFields.set(plan.blockId, fields)
            }
            const receipt: OperationReceipt = {
              contractVersion: '1',
              status: 'committed',
              operationId: context.operationId,
              journeyId: journey.id,
              adminLink: new URL(
                `/journeys/${encodeURIComponent(journey.id)}`,
                config.adminOrigin
              ).href,
              committedRevision: revision,
              kind: 'historical_receipt',
              completedAt: completedAt.toISOString(),
              historyId,
              ...(restoredEntry
                ? {
                    historyAction:
                      operation.tool === 'journey_undo'
                        ? ('undo' as const)
                        : ('redo' as const)
                  }
                : {}),
              changedFields:
                structuralPlan?.changedFields ??
                [...changedFields].map(([blockId, fields]) => ({
                  blockId,
                  fields: [...fields]
                })),
              idMap: structuralPlan?.idMap ?? idMap,
              ...(structuralPlan
                ? {
                    duplicateIdMap: structuralPlan.duplicateIdMap,
                    duplicateMaps: structuralPlan.duplicateMaps,
                    affectedLinks: structuralPlan.affectedLinks
                  }
                : {}),
              effectIds,
              warnings:
                structuralPlan?.warnings ??
                (restoredEntry
                  ? [
                      'Restored recorded content and presentation. This batch has no upload, generation or provider effects.'
                    ]
                  : [])
            }
            assertStructuredResultSize(receipt)
            const storedOperation = await tx.mcpEditOperation.create({
              data: {
                id: receipt.operationId,
                namespaceId: namespace.id,
                idempotencyKey: operation.input.idempotencyKey,
                payloadHash,
                journeyId: journey.id,
                grantVersion: claims.grantVersion,
                revision,
                completedAt,
                resultExpiresAt: new Date(
                  completedAt.getTime() + 30 * 86400000
                ),
                result: json(receipt)
              }
            })
            await tx.mcpEditAudit.create({
              data: {
                namespaceId: namespace.id,
                journeyId: journey.id,
                operationId: receipt.operationId,
                action: operation.tool,
                occurredAt: completedAt,
                expiresAt: new Date(completedAt.getTime() + 90 * 86400000)
              }
            })
            await hooks.checkpoint?.('after_receipt', context)
            if (restoredEntry) {
              await tx.mcpEditHistory.update({
                where: { id: restoredEntry.id },
                data: { undone: operation.tool === 'journey_undo' }
              })
            } else {
              await tx.mcpEditHistory.deleteMany({
                where: {
                  namespaceId: namespace.id,
                  journeyId: journey.id,
                  OR: [
                    { undone: true },
                    {
                      historyGeneration: { lt: claims.consentHistoryGeneration }
                    }
                  ]
                }
              })
            }
            if (historyId && !restoredEntry) {
              await tx.mcpEditHistory.create({
                data: {
                  id: historyId,
                  operationId: receipt.operationId,
                  namespaceId: namespace.id,
                  journeyId: journey.id,
                  changes: json(changes),
                  createdAt: completedAt,
                  expiresAt: new Date(claims.consentExpiresAt + 30 * 86400000),
                  historyGeneration: claims.consentHistoryGeneration
                }
              })
              const retained = await tx.mcpEditHistory.findMany({
                where: { namespaceId: namespace.id, journeyId: journey.id },
                orderBy: { ordinal: 'desc' },
                skip: 5,
                select: { id: true }
              })
              if (retained.length)
                await tx.mcpEditHistory.deleteMany({
                  where: { id: { in: retained.map(({ id }) => id) } }
                })
            }
            await hooks.checkpoint?.('after_history', context)
            if (effectIds.length) {
              await tx.mcpEditEffect.create({
                data: {
                  id: effectIds[0],
                  operationId: receipt.operationId,
                  namespaceId: namespace.id,
                  journeyId: journey.id,
                  kind: 'journey_content_changed',
                  status: 'recorded',
                  createdAt: completedAt,
                  completedAt
                }
              })
            }
            await hooks.checkpoint?.('after_outbox', context)
            await settle('committed')
            await hooks.checkpoint?.('before_commit', context)
            return operationReceipt.parse(storedOperation.result)
          },
          { isolationLevel: 'ReadCommitted', timeout: 20000 }
        )
      // Validate without holding owning locks across coordinator acceptance, then
      // repeat the checks under locks so concurrent Admin changes still win.
      let result = await execute(true)
      if (body.stage !== 'read' || result?.kind !== 'operation_failure') {
        await hooks.checkpoint?.('before_accept', context)
        if (needsChatGate && !(await canEditChat()))
          throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        await authority('accept', { credential, permitId })
        await hooks.checkpoint?.('after_accept', context)
        result = await execute(false)
      }
      if (!result) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      await hooks.checkpoint?.('after_commit', context)
      if (result.kind === 'operation_failure')
        await authority('deny', { credential, permitId })
      if (executionId) await reconcileJourneyEdits(db, config, executionId)
      return Response.json(
        body.stage === 'output' ? { permitId } : { data: result },
        { headers: { 'Cache-Control': 'private, no-store' } }
      )
    } catch (error) {
      if (executionId)
        await reconcileJourneyEdits(db, config, executionId).catch(
          () => undefined
        )
      await authority('deny', {
        credential: verifiedCredential,
        permitId: pendingPermit
      }).catch(() => undefined)
      return Response.json(
        { error: editError(error) },
        { status: 403, headers: { 'Cache-Control': 'private, no-store' } }
      )
    }
  }
  return Object.assign(handler, {
    reconcile: (permitId?: string) =>
      reconcileJourneyEdits(db, config, permitId),
    cleanup: () => cleanupJourneyEdits(db, config, hooks.now)
  })
}
