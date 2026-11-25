import { createHmac, randomUUID } from 'node:crypto'

import type { Plugin } from 'graphql-yoga'
import type { Logger } from 'pino'
import { z } from 'zod'

import { toAiChatSettings } from '@core/journeys/ui/aiChatSettings'
import { type Prisma, type PrismaClient } from '@core/prisma/journeys/client'
import { appearanceCommandNames } from '@core/yoga/mcp/appearanceContract'
import { formCommandNames } from '@core/yoga/mcp/formContract'
import { mediaCommandNames } from '@core/yoga/mcp/mediaContract'
import { mediaJobTools } from '@core/yoga/mcp/mediaJobContract'
import {
  type ReadCredential,
  type ReadRequest,
  type ReadResult,
  type ReadTrust,
  assertRequestInputSize,
  boundedJson,
  fingerprint,
  internalSignature,
  maxTransportBytes,
  postJson,
  readFailure,
  readTransportRequest,
  readTrustSchema,
  resultContractVersion,
  safeReadError,
  sameSecret,
  serviceUrl,
  verifyReadCredential
} from '@core/yoga/mcp/readContract'
import { structureCommandNames } from '@core/yoga/mcp/structureContract'

import { Action, journeyAcl } from '../schema/journey/journey.acl'

import { type JourneyEditHooks, createJourneyEditHandler } from './mcpEdits'
import {
  type DestinationRoutes,
  eligibleDestinations,
  selectedFormDestinations
} from './mcpFormDestinations'
import { type MediaClientConfig, mediaRequest } from './mcpMediaClient'
import { boundedReadPage } from './mcpReadPage'
import { reconcileJourneyReads } from './mcpReadSettlement'

export interface JourneyReadsConfig extends ReadTrust {
  internalSecret: string
  authorityUrl: string
  authoritySecret: string
  adminOrigin: string
  editsEnabled?: boolean
  media?: MediaClientConfig
}

export function journeyReadsEnvironment(
  env: NodeJS.ProcessEnv,
  adminOrigin: string
): JourneyReadsConfig | undefined {
  if (!env.MCP_READS_ENABLED || env.MCP_READS_ENABLED === 'false') return
  if (env.MCP_READS_ENABLED !== 'true')
    throw new Error('Invalid read configuration')
  if (
    env.MCP_EDITS_ENABLED !== undefined &&
    !['true', 'false'].includes(env.MCP_EDITS_ENABLED)
  )
    throw new Error('Invalid edit configuration')
  const config: JourneyReadsConfig = readTrustSchema
    .extend({
      internalSecret: z.string().min(32),
      authorityUrl: serviceUrl,
      authoritySecret: z.string().min(32),
      adminOrigin: serviceUrl,
      editsEnabled: z.boolean()
    })
    .parse({
      issuer: env.MCP_READ_ISSUER,
      audience: env.MCP_READ_GATEWAY_AUDIENCE,
      environment: env.MCP_READ_ENVIRONMENT,
      publicKey: JSON.parse(env.MCP_READ_PUBLIC_KEY ?? 'null'),
      internalSecret: env.JOURNEYS_MCP_INTERNAL_SECRET,
      authorityUrl: env.MCP_READ_AUTHORITY_URL,
      authoritySecret: env.JOURNEYS_MCP_AUTHORITY_SECRET,
      adminOrigin,
      editsEnabled: env.MCP_EDITS_ENABLED === 'true'
    })
  if (env.MCP_MEDIA_ENABLED === 'true')
    config.media = z
      .object({ url: serviceUrl, internalSecret: z.string().min(32) })
      .parse({
        url: env.MCP_MEDIA_OWNER_URL,
        internalSecret: env.MEDIA_MCP_INTERNAL_SECRET
      })
  else if (env.MCP_MEDIA_ENABLED && env.MCP_MEDIA_ENABLED !== 'false')
    throw new Error('Invalid media configuration')
  return config
}

const permitSchema = z.object({ permitId: z.string().uuid() })
const blockSelect = {
  id: true,
  typename: true,
  parentBlockId: true,
  parentOrder: true,
  label: true,
  placeholder: true,
  required: true,
  variant: true,
  color: true,
  size: true,
  startIconId: true,
  endIconId: true,
  eventLabel: true,
  endEventLabel: true,
  backgroundColor: true,
  backdropBlur: true,
  coverBlockId: true,
  fullscreen: true,
  themeMode: true,
  themeName: true,
  spacing: true,
  gap: true,
  direction: true,
  justifyContent: true,
  alignItems: true,
  xl: true,
  lg: true,
  sm: true,
  name: true,
  src: true,
  width: true,
  height: true,
  alt: true,
  blurhash: true,
  submitIconId: true,
  submitLabel: true,
  submitEnabled: true,
  nextBlockId: true,
  locked: true,
  hint: true,
  hideLabel: true,
  minRows: true,
  content: true,
  align: true,
  startAt: true,
  endAt: true,
  muted: true,
  autoplay: true,
  posterBlockId: true,
  pollOptionImageBlockId: true,
  fullsize: true,
  videoId: true,
  videoVariantLanguageId: true,
  source: true,
  title: true,
  description: true,
  image: true,
  duration: true,
  objectFit: true,
  subtitleLanguageId: true,
  showGeneratedSubtitles: true,
  triggerStart: true,
  x: true,
  y: true,
  type: true,
  focalTop: true,
  focalLeft: true,
  gridView: true,
  scale: true,
  slug: true,
  min: true,
  max: true,
  integrationId: true,
  routeId: true,
  showAssistant: true,
  expandChatByDefault: true,
  settings: true,
  action: {
    select: {
      parentBlockId: true,
      gtmEventName: true,
      blockId: true,
      url: true,
      target: true,
      email: true,
      phone: true,
      countryCode: true,
      contactAction: true,
      chatUrl: true
    }
  }
} satisfies Prisma.BlockSelect
const blockReferences = [
  'parentBlockId',
  'startIconId',
  'endIconId',
  'coverBlockId',
  'submitIconId',
  'nextBlockId',
  'posterBlockId',
  'pollOptionImageBlockId'
] as const

function cursor(value: unknown, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encoded}.${createHmac('sha256', secret).update(encoded).digest('hex')}`
}
function offsetFrom(
  token: string | undefined,
  binding: string,
  secret: string
): number {
  if (!token) return 0
  const parts = token.split('.')
  if (
    parts.length !== 2 ||
    !sameSecret(
      parts[1],
      createHmac('sha256', secret).update(parts[0]).digest('hex')
    )
  )
    throw new Error('VALIDATION_FAILED')
  const value = z
    .object({
      binding: z.string(),
      offset: z.number().int().nonnegative().max(100000)
    })
    .strict()
    .parse(JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')))
  if (value.binding !== binding) throw new Error('REVISION_CONFLICT')
  return value.offset
}

export function createJourneyReadHandler(
  config: JourneyReadsConfig,
  db: PrismaClient,
  logger?: Pick<Logger, 'info'>,
  editHooks?: JourneyEditHooks
) {
  const edits = createJourneyEditHandler(config, db, editHooks)
  const authority = (action: string, body: unknown) =>
    postJson(
      new URL(`/internal/reads/${action}`, config.authorityUrl).href,
      body,
      `Bearer ${config.authoritySecret}`
    )
  const handler = async (request: Request): Promise<Response> => {
    const executorId = randomUUID()
    logger?.info({ event: 'mcp_read_executor_started', executorId })
    let readPermit: string | undefined
    let verifiedCredential: string | undefined
    let pendingPermit: string | undefined
    try {
      if (
        request.method !== 'POST' ||
        request.headers.has('authorization') ||
        request.headers.has('interop-token')
      )
        throw new Error('Access denied')
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
        body.request.tool === 'journey_edit' ||
        body.request.tool === 'journey_operation_get' ||
        body.request.tool === 'journey_history' ||
        body.request.tool === 'journey_undo' ||
        body.request.tool === 'journey_redo'
      )
        return edits(
          new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(body)
          })
        )
      const dataRequest = body.request
      const mediaJob = (mediaJobTools as readonly string[]).includes(
        dataRequest.tool
      )
      if (
        (dataRequest.tool === 'journey_media_search' || mediaJob) &&
        !config.media
      )
        throw new Error('Access denied')
      if (
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
        throw new Error('Access denied')
      const ids =
        body.request.tool !== 'journeys_list'
          ? [body.request.input.journeyId]
          : claims.journeyIds
      if (ids.some((id) => !claims.journeyIds.includes(id)))
        throw new Error('Access denied')
      // Resolve owning teams before gate capture; never read rights before it.
      const resources = await db.journey.findMany({
        where: { id: { in: ids }, deletedAt: null },
        select: { id: true, teamId: true }
      })
      const { permitId } = permitSchema.parse(
        await authority('prepare', {
          credential,
          executorId: body.stage === 'read' ? executorId : claims.executorId,
          stage: body.stage,
          media: dataRequest.tool === 'journey_media_search',
          resources: resources.map(({ id, teamId }) => ({
            journeyId: id,
            teamId
          })),
          outputHash: body.stage === 'output' ? body.outputHash : undefined
        })
      )
      pendingPermit = permitId
      if (body.stage === 'read') {
        await db.mcpReadExecution.create({
          data: {
            id: permitId,
            executorId,
            requestId: claims.requestId,
            responseExpiresAt: new Date(claims.expiresAt)
          }
        })
        readPermit = permitId
      }
      const mediaSearch =
        dataRequest.tool === 'journey_media_search' || mediaJob
          ? await mediaRequest(
              mediaJob
                ? {
                    ...config.media!,
                    url: new URL('/mcp/media-jobs', config.media!.url).href
                  }
                : config.media!,
              credential,
              {
                permitId,
                request: dataRequest,
                ...(mediaJob ? {} : { search: dataRequest.input })
              }
            )
          : undefined
      const result = await db.$transaction(
        async (tx) => {
          if (readPermit) {
            await tx.$queryRaw`SELECT id FROM "McpReadExecution" WHERE id = ${readPermit} FOR UPDATE`
            const execution = await tx.mcpReadExecution.findUniqueOrThrow({
              where: { id: readPermit }
            })
            if (execution.status !== 'prepared')
              throw new Error('Access denied')
          }
          const ordered = [...resources].sort((a, b) =>
            a.id < b.id ? -1 : a.id > b.id ? 1 : 0
          )
          for (const resource of ordered)
            await tx.$queryRaw`SELECT id FROM "Journey" WHERE id = ${resource.id} FOR SHARE`
          const profile = await tx.journeyProfile.findUnique({
            where: { userId: claims.subject }
          })
          if (!profile?.acceptedTermsAt) throw new Error('Access denied')
          const journeys = await tx.journey.findMany({
            where: {
              id: { in: ids },
              deletedAt: null,
              archivedAt: null,
              trashedAt: null,
              AND: [
                { OR: [{ template: false }, { template: null }] },
                { OR: [{ templateSite: false }, { templateSite: null }] }
              ],
              status: { in: ['draft', 'published'] }
            },
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } },
              revision: true
            },
            orderBy: { id: 'asc' }
          })
          const allowed = journeys.filter((journey) => {
            if (
              resources.find((resource) => resource.id === journey.id)
                ?.teamId !== journey.teamId
            )
              throw new Error('Access denied')
            return journeyAcl(Action.Read, journey, {
              id: claims.subject
            } as Parameters<typeof journeyAcl>[2])
          })
          if (body.request.tool !== 'journeys_list' && allowed.length !== 1)
            throw new Error('Access denied')
          const witness =
            body.stage === 'output'
              ? await tx.mcpReadExecution.findUnique({
                  where: { requestId: claims.requestId }
                })
              : undefined
          let data: ReadResult
          if (witness?.status === 'settled' && witness.failureCode) {
            data = readFailure.parse({
              contractVersion: resultContractVersion,
              kind: 'read_failure',
              code: witness.failureCode
            })
          } else {
            try {
              data =
                dataRequest.tool === 'journey_media_search' || mediaJob
                  ? {
                      contractVersion: resultContractVersion,
                      kind: 'media_sources',
                      journeyId: ids[0],
                      ...z.record(z.string(), z.unknown()).parse(mediaSearch)
                    }
                  : await snapshot(
                      tx,
                      dataRequest as Parameters<typeof snapshot>[1],
                      claims,
                      allowed,
                      config,
                      editHooks?.destinationRoutes
                    )
            } catch (error) {
              const failure = z
                .enum(['REVISION_CONFLICT', 'LIMIT_EXCEEDED'])
                .safeParse(error instanceof Error ? error.message : undefined)
              if (!failure.success) throw error
              data = {
                contractVersion: resultContractVersion,
                kind: 'read_failure',
                code: failure.data
              }
            }
          }
          if (body.stage === 'output' && fingerprint(data) !== body.dataHash)
            throw new Error('Access denied')
          await authority('accept', { credential, permitId })
          if (readPermit)
            await tx.mcpReadExecution.update({
              where: { id: readPermit },
              data: {
                status: 'settled',
                completedAt: new Date(),
                failureCode:
                  data.kind === 'read_failure' ? String(data.code) : null
              }
            })
          return data
        },
        { isolationLevel: 'RepeatableRead', timeout: 20000 }
      )
      if (body.stage === 'output')
        return Response.json(
          { permitId },
          { headers: { 'Cache-Control': 'private, no-store' } }
        )
      // A successful transaction is positive evidence the bounded read settled.
      // If either response is lost, leave the durable permit unresolved.
      await reconcileJourneyReads(db, config, permitId)
      return Response.json(
        { data: result },
        { headers: { 'Cache-Control': 'private, no-store' } }
      )
    } catch (error) {
      if (readPermit)
        await reconcileJourneyReads(db, config, readPermit).catch(
          () => undefined
        )
      await authority('deny', {
        credential: verifiedCredential,
        permitId: pendingPermit
      }).catch(() => undefined)
      const code = safeReadError(error)
      return Response.json(
        { error: code },
        { status: 403, headers: { 'Cache-Control': 'private, no-store' } }
      )
    }
  }
  let reconciling = false
  return Object.assign(handler, {
    async reconcile() {
      if (reconciling) return
      reconciling = true
      try {
        const failed = await reconcileJourneyReads(db, config)
        await edits.reconcile()
        await edits.cleanup()
        if (failed)
          logger?.info({ event: 'mcp_read_reconciliation_pending', failed })
      } finally {
        reconciling = false
      }
    }
  })
}

type ReadJourney = Prisma.JourneyGetPayload<{ include: { revision: true } }>
async function snapshot(
  tx: Prisma.TransactionClient,
  request: Extract<
    ReadRequest,
    { tool: 'journey_read' | 'journeys_list' | 'journey_preview' }
  >,
  claims: ReadCredential,
  journeys: ReadJourney[],
  config: JourneyReadsConfig,
  destinationRoutes?: DestinationRoutes
): Promise<ReadResult> {
  const link = (id: string) =>
    new URL(`/journeys/${encodeURIComponent(id)}`, config.adminOrigin).href
  const allowedOperations = (journey: ReadJourney) => [
    'journey_read',
    'journey_preview',
    'journey_operation_get',
    ...(config.media ? ['journey_media_search'] : []),
    ...(journey.status === 'draft' ? ['journey_history'] : []),
    ...(config.editsEnabled &&
    claims.mode === 'edit' &&
    journey.status === 'draft'
      ? ['journey_edit', 'journey_undo', 'journey_redo']
      : [])
  ]
  if (request.tool === 'journeys_list') {
    const { input } = request
    const filtered = journeys.filter(
      (journey) =>
        (!input.status || journey.status === input.status) &&
        (!input.query ||
          journey.title
            .toLocaleLowerCase()
            .includes(input.query.toLocaleLowerCase()))
    )
    const binding = fingerprint([
      claims.subject,
      claims.connectionId,
      claims.grantVersion,
      { ...input, cursor: undefined },
      filtered.map((journey) => [
        journey.id,
        journey.revision?.revision.toString()
      ])
    ])
    const offset = offsetFrom(input.cursor, binding, config.internalSecret)
    return boundedResult({
      journeys: filtered.slice(offset, offset + input.limit).map((journey) => ({
        id: journey.id,
        title: journey.title,
        status: journey.status,
        allowedOperations: allowedOperations(journey),
        adminLink: link(journey.id)
      })),
      nextCursor:
        offset + input.limit < filtered.length
          ? cursor(
              { binding, offset: offset + input.limit },
              config.internalSecret
            )
          : null
    })
  }
  const journey = journeys[0]
  if (!journey.revision) throw new Error('Access denied')
  const revision = journey.revision.revision.toString()
  if (request.tool === 'journey_preview') {
    if (request.input.expectedRevision !== revision)
      throw new Error('REVISION_CONFLICT')
    const steps = await tx.block.findMany({
      where: { journeyId: journey.id, deletedAt: null, typename: 'StepBlock' },
      select: { id: true, nextBlockId: true, slug: true },
      orderBy: [{ parentOrder: 'asc' }, { id: 'asc' }],
      take: 100001
    })
    if (steps.length > 100000) throw new Error('LIMIT_EXCEEDED')
    if (
      request.input.startStepId &&
      !steps.some(({ id }) => id === request.input.startStepId)
    )
      throw new Error('Access denied')
    const stepIds = new Set(steps.map(({ id }) => id))
    const routes = await tx.block.findMany({
      where: {
        journeyId: journey.id,
        deletedAt: null,
        action: { blockId: { in: [...stepIds] } }
      },
      select: { id: true, action: { select: { blockId: true } } },
      orderBy: { id: 'asc' },
      take: 101
    })
    const preview = new URL(
      `/journeys/${encodeURIComponent(journey.id)}/preview`,
      config.adminOrigin
    )
    preview.searchParams.set('revision', revision)
    if (request.input.startStepId)
      preview.searchParams.set('stepId', request.input.startStepId)
    return boundedResult({
      journeyId: journey.id,
      revision,
      status: journey.status,
      previewLink: preview.href,
      adminLink: link(journey.id),
      routeChecklist: {
        complete: steps.length <= 100 && routes.length <= 100,
        steps: steps.slice(0, 100).map((step) => ({
          ...step,
          nextBlockId:
            step.nextBlockId && stepIds.has(step.nextBlockId)
              ? step.nextBlockId
              : null
        })),
        answers: routes.slice(0, 100).map((block) => ({
          blockId: block.id,
          nextStepId: block.action?.blockId
        }))
      },
      warnings: [
        ...(steps.length > 100 || routes.length > 100
          ? [
              'Route checklist is partial. Continue checking the remaining routes in private playback.'
            ]
          : []),
        'Private preview requires current Admin access. The link grants no access.',
        'Preview disables visitor events, submissions and external actions. Public media URLs remain public. Publish through the Admin editor with current Manage rights.'
      ]
    })
  }
  if (request.input.revision && request.input.revision !== revision)
    throw new Error('REVISION_CONFLICT')
  const binding = fingerprint([
    claims.subject,
    claims.connectionId,
    claims.grantVersion,
    { ...request.input, cursor: undefined, revision: undefined },
    revision
  ])
  const offset = offsetFrom(
    request.input.cursor,
    binding,
    config.internalSecret
  )
  const warnings = [
    'Preserve omitted content. Host changes and publication are unavailable.',
    'Inaccessible form destinations, source metadata and unmodeled block settings are preserved but omitted. The outline is not a lossless replacement document.'
  ]
  const base = {
    journeyId: journey.id,
    revision,
    status: journey.status,
    allowedOperations: allowedOperations(journey),
    commands:
      config.editsEnabled &&
      claims.mode === 'edit' &&
      journey.status === 'draft'
        ? [
            'typography_set',
            ...structureCommandNames,
            ...formCommandNames,
            ...appearanceCommandNames,
            ...(config.media ? mediaCommandNames : [])
          ]
        : [],
    adminLink: link(journey.id),
    warnings
  }
  if (request.input.view === 'form_destinations') {
    if (offset !== 0 || request.input.stepIds)
      throw new Error('VALIDATION_FAILED')
    return boundedResult({
      ...base,
      destinations: await eligibleDestinations(tx, journey, {
        userId: claims.subject,
        routes: destinationRoutes,
        // Reserve time for fresh acceptance and settlement before output's
        // five-second deadline, regardless of the integration count.
        signal: AbortSignal.timeout(2000)
      }),
      complete: true,
      nextCursor: null
    })
  }
  const ids = await tx.block.findMany({
    where: { journeyId: journey.id, deletedAt: null },
    select: { id: true, parentBlockId: true, typename: true },
    take: 100001
  })
  if (ids.length > 100000) throw new Error('LIMIT_EXCEEDED')
  const owned = new Set(ids.map(({ id }) => id))
  const byId = new Map(ids.map((block) => [block.id, block]))
  const safeReference = (id: string | null) => (id && owned.has(id) ? id : null)
  if (request.input.view === 'settings') {
    if (offset !== 0) throw new Error('VALIDATION_FAILED')
    const settings = await tx.journey.findUniqueOrThrow({
      where: { id: journey.id, deletedAt: null },
      select: {
        title: true,
        description: true,
        languageId: true,
        seoTitle: true,
        seoDescription: true,
        creatorDescription: true,
        themeMode: true,
        themeName: true,
        website: true,
        showShareButton: true,
        showLikeButton: true,
        showDislikeButton: true,
        displayTitle: true,
        showHosts: true,
        showChatButtons: true,
        showReactionButtons: true,
        showLogo: true,
        showMenu: true,
        showDisplayTitle: true,
        showAssistant: true,
        menuButtonIcon: true,
        socialNodeX: true,
        socialNodeY: true,
        host: {
          select: { title: true, location: true, src1: true, src2: true }
        },
        journeyTheme: {
          select: { headerFont: true, bodyFont: true, labelFont: true }
        },
        chatButtons: {
          select: { id: true, platform: true, link: true },
          take: 101
        }
      }
    })
    if (settings.chatButtons.length > 100) throw new Error('LIMIT_EXCEEDED')
    return boundedResult({
      ...base,
      settings: {
        ...settings,
        effectiveDisplayTitle: settings.displayTitle ?? settings.seoTitle,
        primaryImageBlockId: safeReference(journey.primaryImageBlockId),
        creatorImageBlockId: safeReference(journey.creatorImageBlockId),
        logoImageBlockId: safeReference(journey.logoImageBlockId),
        menuStepBlockId: safeReference(journey.menuStepBlockId)
      },
      nextCursor: null
    })
  }
  const selected = request.input.stepIds
  if (
    selected?.some(
      (id) =>
        !ids.some((block) => block.id === id && block.typename === 'StepBlock')
    )
  )
    throw new Error('Access denied')
  const inSteps = (id: string): boolean => {
    const visited = new Set<string>()
    let current: string | null = id
    while (current && !visited.has(current)) {
      if (selected?.includes(current)) return true
      visited.add(current)
      current = byId.get(current)?.parentBlockId ?? null
    }
    return false
  }
  const page = await tx.block.findMany({
    where: {
      journeyId: journey.id,
      deletedAt: null,
      ...(request.input.view === 'outline' ? { typename: 'StepBlock' } : {}),
      ...(selected
        ? {
            id: {
              in: ids
                .filter((block) => inSteps(block.id))
                .map((block) => block.id)
            }
          }
        : {})
    },
    select: blockSelect,
    orderBy: { id: 'asc' },
    skip: offset,
    take: 101
  })
  // An explicitly removed Step can still be the destination of an unchanged
  // incoming route. Return that owned ID so a later deliberate repair can read
  // the broken relationship; foreign destination IDs remain hidden.
  const destinationIds = page.flatMap((block) =>
    [block.nextBlockId, block.action?.blockId].filter((id): id is string =>
      Boolean(id)
    )
  )
  const removedDestinations = await tx.block.findMany({
    where: {
      id: { in: destinationIds },
      journeyId: journey.id,
      typename: 'StepBlock',
      deletedAt: { not: null }
    },
    select: { id: true }
  })
  const removedStepIds = new Set(removedDestinations.map(({ id }) => id))
  const routeIds = new Set([...owned, ...removedStepIds])
  const destinations =
    request.input.view === 'outline'
      ? undefined
      : await selectedFormDestinations(tx, journey, page.slice(0, 100), {
          userId: claims.subject,
          routes: destinationRoutes
        })
  const blocks = page.slice(0, 100).map((block) => {
    for (const field of blockReferences)
      block[field] =
        field === 'nextBlockId' &&
        block[field] &&
        removedStepIds.has(block[field])
          ? block[field]
          : safeReference(block[field])
    const { integrationId, routeId, ...content } = block
    return request.input.view === 'outline'
      ? {
          id: block.id,
          typename: block.typename,
          parentOrder: block.parentOrder,
          slug: block.slug,
          nextBlockId: block.nextBlockId,
          ...(block.nextBlockId && removedStepIds.has(block.nextBlockId)
            ? { unresolvedDefaultRoute: true }
            : {}),
          x: block.x,
          y: block.y,
          locked: block.locked
        }
      : {
          ...content,
          ...destinations?.get(block.id),
          ...(block.nextBlockId && removedStepIds.has(block.nextBlockId)
            ? { unresolvedDefaultRoute: true }
            : {}),
          settings: finiteSettings(block),
          action: typedAction(block.action, routeIds, removedStepIds),
          ...(block.typename === 'CardBlock'
            ? { aiChat: toAiChatSettings(block) }
            : {})
        }
  })
  return boundedReadPage(
    { ...base, view: request.input.view },
    blocks,
    page.length > 100,
    (count) =>
      cursor({ binding, offset: offset + count }, config.internalSecret)
  )
}
function finiteSettings(
  block: Prisma.BlockGetPayload<{ select: typeof blockSelect }>
): Record<string, unknown> {
  const settings = block.settings
  if (!settings || typeof settings !== 'object' || Array.isArray(settings))
    return {}
  const result: Record<string, unknown> = {}
  if (
    block.typename === 'TypographyBlock' ||
    block.typename === 'ButtonBlock'
  ) {
    const color = z
      .string()
      .regex(/^#[0-9a-f]{6}$/i)
      .nullable()
      .safeParse(settings.color)
    if (color.success) result.color = color.data
  }
  if (block.typename === 'ButtonBlock') {
    const alignment = z
      .enum(['left', 'center', 'right', 'justify'])
      .nullable()
      .safeParse(settings.alignment)
    if (alignment.success) result.alignment = alignment.data
  }
  return result
}
function typedAction(
  action: Prisma.BlockGetPayload<{ select: typeof blockSelect }>['action'],
  owned: Set<string>,
  removedStepIds: Set<string> = new Set()
): unknown {
  if (!action) return null
  const base = {
    parentBlockId: action.parentBlockId,
    gtmEventName: action.gtmEventName
  }
  if (action.blockId !== null)
    return {
      ...base,
      type: 'NavigateToBlockAction',
      blockId: owned.has(action.blockId) ? action.blockId : null,
      ...(removedStepIds.has(action.blockId) ? { unresolved: true } : {})
    }
  if (action.email !== null)
    return { ...base, type: 'EmailAction', email: action.email }
  if (action.phone !== null)
    return {
      ...base,
      type: 'PhoneAction',
      phone: action.phone,
      countryCode: action.countryCode,
      contactAction: action.contactAction
    }
  if (action.chatUrl !== null)
    return { ...base, type: 'ChatAction', chatUrl: action.chatUrl }
  return { ...base, type: 'LinkAction', url: action.url, target: action.target }
}
function boundedResult(value: Record<string, unknown>): ReadResult {
  const result = { contractVersion: resultContractVersion, ...value }
  if (Buffer.byteLength(JSON.stringify(result)) > 524288)
    throw new Error('LIMIT_EXCEEDED')
  return result
}

export function useJourneyMcpReads(
  handler?: ReturnType<typeof createJourneyReadHandler>
): Plugin {
  let timer: ReturnType<typeof setInterval> | undefined
  return {
    onYogaInit() {
      if (!handler) return
      const recover = () => {
        void handler.reconcile().catch(() => undefined)
      }
      recover()
      timer = setInterval(recover, 60000)
      timer.unref()
    },
    onDispose() {
      clearInterval(timer)
    },
    async onRequest(payload) {
      const { request } = payload
      if (new URL(request.url, 'http://yoga').pathname === '/mcp/reads') {
        payload.endResponse(
          handler
            ? await handler(request)
            : Response.json(
                { error: 'ACCESS_DENIED_OR_NOT_FOUND' },
                { status: 403 }
              )
        )
        return
      }
      if (
        request.headers.has('x-mcp-context') ||
        request.headers.has('x-mcp-signature') ||
        /^(MCP|Bearer) /i.test(request.headers.get('authorization') ?? '')
      )
        payload.endResponse(
          Response.json(
            { error: 'ACCESS_DENIED_OR_NOT_FOUND' },
            { status: 403 }
          )
        )
    }
  }
}
