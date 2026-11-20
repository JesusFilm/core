import { randomUUID } from 'node:crypto'

import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { Prisma, type PrismaClient } from '@core/prisma/journeys/client'
import {
  type OperationReceipt,
  type OperationResult,
  type TypographyInverse,
  canonicalFingerprint,
  commandRegistry,
  operationFailure,
  operationReceipt,
  operationResult
} from '@core/yoga/mcp/editContract'
import {
  assertRequestInputSize,
  boundedJson,
  fingerprint,
  internalSignature,
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
  cleanupJourneyEdits,
  editDatabaseTime,
  reconcileJourneyEdits
} from './mcpEditsStore'
import type { JourneyReadsConfig } from './mcpReads'

export type EditCheckpoint =
  | 'execution_prepared'
  | 'before_accept'
  | 'after_accept'
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
        !['journey_edit', 'journey_operation_get'].includes(
          body.request.tool
        ) ||
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
      if (
        operation.tool !== 'journey_edit' &&
        operation.tool !== 'journey_operation_get'
      )
        throw new Error('VALIDATION_FAILED')
      if (
        !claims.journeyIds.includes(operation.input.journeyId) ||
        (operation.tool === 'journey_edit' &&
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
      await authorizedJourney(db)
      await hooks.checkpoint?.('before_accept', context)
      await authority('accept', { credential, permitId })
      await hooks.checkpoint?.('after_accept', context)
      const result = await db.$transaction(
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
          const prior = await tx.mcpEditOperation.findFirst({
            where: {
              namespaceId: namespace.id,
              ...(operation.tool === 'journey_edit'
                ? { idempotencyKey: operation.input.idempotencyKey }
                : operation.input.operationId
                  ? { id: operation.input.operationId }
                  : { idempotencyKey: operation.input.idempotencyKey })
            }
          })
          const settle = async (status: 'committed' | 'settled') => {
            if (!executionId) return
            await tx.mcpEditExecution.update({
              where: { id: executionId },
              data: {
                status,
                operationId: context.operationId,
                completedAt: await editDatabaseTime(tx, hooks.now)
              }
            })
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
              operation.tool === 'journey_edit' &&
              prior.payloadHash !== canonicalFingerprint(operation.input)
            ) {
              retained = {
                contractVersion: '1',
                kind: 'operation_failure',
                code: 'IDEMPOTENCY_KEY_REUSED'
              }
            } else if (prior.resultExpiresAt <= now || prior.result === null) {
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
          try {
            await lockDraftJourneyRevision(
              tx,
              journey.id,
              operation.input.expectedRevision
            )
          } catch (error) {
            const failure =
              error instanceof GraphQLError
                ? z
                    .enum(['REVISION_CONFLICT', 'NOT_EDITABLE'])
                    .safeParse(error.extensions.code)
                : undefined
            if (!failure?.success || !executionId) throw error
            // This is a private response to an authorized rejected request,
            // not an accepted edit/key. Its signed request witness lets the
            // final sender release exactly this outcome after fresh checks.
            await tx.mcpEditExecution.update({
              where: { id: executionId },
              data: {
                status: 'settled',
                failureCode: failure.data,
                completedAt: await editDatabaseTime(tx, hooks.now)
              }
            })
            return operationFailure.parse({
              contractVersion: '1',
              kind: 'operation_failure',
              code: failure.data
            })
          }
          const changes: TypographyInverse[] = []
          const plans: Array<{
            blockId: string
            patch: Prisma.BlockUpdateInput
            inverse: TypographyInverse
            fields: TypographyInverse['fields'][number]['field'][]
          }> = []
          const projected = new Map<
            string,
            Prisma.BlockGetPayload<Record<string, never>>
          >()
          for (const command of operation.input.commands) {
            const block =
              projected.get(command.blockId) ??
              (await tx.block.findUnique({
                where: {
                  id: command.blockId,
                  journeyId: journey.id,
                  deletedAt: null
                }
              }))
            if (
              !block ||
              block.typename !== 'TypographyBlock' ||
              !block.parentBlockId
            )
              throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
            const card = await tx.block.findUnique({
              where: {
                id: block.parentBlockId,
                journeyId: journey.id,
                deletedAt: null
              }
            })
            const step = card?.parentBlockId
              ? await tx.block.findUnique({
                  where: {
                    id: card.parentBlockId,
                    journeyId: journey.id,
                    deletedAt: null
                  }
                })
              : null
            if (
              card?.typename !== 'CardBlock' ||
              step?.typename !== 'StepBlock' ||
              step.parentBlockId !== null ||
              (await tx.block.count({
                where: {
                  journeyId: journey.id,
                  parentBlockId: step.id,
                  typename: 'CardBlock',
                  deletedAt: null
                }
              })) !== 1
            )
              throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
            const applied = commandRegistry[command.type].apply(block, command)
            if (!applied.changedFields.length) continue
            const patch: Prisma.BlockUpdateInput = {
              content: applied.patch.content,
              variant: applied.patch.variant,
              align: applied.patch.align,
              ...(applied.patch.settings
                ? { settings: json(applied.patch.settings) }
                : {})
            }
            plans.push({
              blockId: block.id,
              patch,
              inverse: applied.inverse,
              fields: applied.changedFields
            })
            projected.set(block.id, {
              ...block,
              ...applied.patch,
              settings: applied.patch.settings
                ? (json(applied.patch.settings) as Prisma.JsonValue)
                : block.settings
            })
          }
          context.operationId = randomUUID()
          for (const plan of plans) {
            await tx.block.update({
              where: { id: plan.blockId },
              data: plan.patch
            })
            changes.push(plan.inverse)
          }
          await hooks.checkpoint?.('after_content', context)
          const revision = await readJourneyRevision(tx, journey.id)
          await hooks.checkpoint?.('after_revision', context)
          const completedAt = await editDatabaseTime(tx, hooks.now)
          const historyId = changes.length ? randomUUID() : null
          const effectIds = changes.length ? [randomUUID()] : []
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
            changedFields: plans.map(({ blockId, fields }) => ({
              blockId,
              fields
            })),
            idMap: {},
            effectIds,
            warnings: []
          }
          await tx.mcpEditOperation.create({
            data: {
              id: receipt.operationId,
              namespaceId: namespace.id,
              idempotencyKey: operation.input.idempotencyKey,
              payloadHash: canonicalFingerprint(operation.input),
              journeyId: journey.id,
              grantVersion: claims.grantVersion,
              revision,
              completedAt,
              resultExpiresAt: new Date(completedAt.getTime() + 30 * 86400000),
              result: json(receipt)
            }
          })
          await hooks.checkpoint?.('after_receipt', context)
          if (historyId) {
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
          return operationReceipt.parse(receipt)
        },
        { isolationLevel: 'ReadCommitted', timeout: 20000 }
      )
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
