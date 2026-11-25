import axios from 'axios'
import { z } from 'zod'

import type { Prisma } from '@core/prisma/journeys/client'
import { decryptSymmetric } from '@core/yoga/crypto'

import { type StructureState, live, requiredString } from './mcpStructureState'

const routes = z
  .array(
    z.object({ id: z.string().min(1).max(200), name: z.string().max(250) })
  )
  .max(100)
type Integration = Prisma.IntegrationGetPayload<Record<string, never>>
export type DestinationRoutes = (
  integration: Integration,
  signal?: AbortSignal
) => Promise<z.infer<typeof routes>>
export interface DestinationAccess {
  userId: string
  routes?: DestinationRoutes
  signal?: AbortSignal
}

/** Read existing provider configuration only. No submission, sync, credential
 * creation or response endpoint is reachable through this participant. */
export const readDestinationRoutes: DestinationRoutes = async (
  integration,
  signal
) => {
  try {
    if (
      !integration.accessId ||
      !integration.accessSecretCipherText ||
      !integration.accessSecretIv ||
      !integration.accessSecretTag ||
      !process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET ||
      !process.env.GROWTH_SPACES_URL
    )
      throw new Error()
    const secret = await decryptSymmetric(
      integration.accessSecretCipherText,
      integration.accessSecretIv,
      integration.accessSecretTag,
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
    )
    const result = await axios.get(
      new URL('/routes', process.env.GROWTH_SPACES_URL).href,
      {
        headers: { 'Access-Id': integration.accessId, 'Access-Secret': secret },
        timeout: 5000,
        signal,
        maxContentLength: 262144,
        maxRedirects: 0
      }
    )
    return routes.parse(result.data)
  } catch {
    throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  }
}

async function loadEligibleIntegrations(
  tx: Prisma.TransactionClient,
  journey: { teamId?: string | null },
  userId: string,
  integrationIds?: string[]
) {
  if (!journey.teamId) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  const membership = await tx.userTeam.findUnique({
    where: { teamId_userId: { teamId: journey.teamId, userId } }
  })
  if (!membership || !['member', 'manager'].includes(membership.role))
    throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  // Lock current configuration through final acceptance and commit. Admin
  // credential replacement, team reassignment and deletion cannot race this read.
  await tx.$queryRaw`SELECT id FROM "Integration" WHERE "teamId" = ${journey.teamId} AND type = 'growthSpaces' ORDER BY id FOR SHARE`
  const integrations = await tx.integration.findMany({
    where: {
      teamId: journey.teamId,
      type: 'growthSpaces',
      ...(integrationIds ? { id: { in: integrationIds } } : {})
    },
    take: 101,
    orderBy: { id: 'asc' }
  })
  if (integrations.length > 100) throw new Error('LIMIT_EXCEEDED')
  return integrations.filter(
    (integration) => integration.accessId && !integration.oauthStale
  )
}

async function resolveDestination(
  integration: Integration,
  access: DestinationAccess
) {
  return {
    integrationId: integration.id,
    name: 'Growth Spaces',
    routes: routes.parse(
      await (access.routes ?? readDestinationRoutes)(integration, access.signal)
    )
  }
}

export async function eligibleDestinations(
  tx: Prisma.TransactionClient,
  journey: { teamId?: string | null },
  access: DestinationAccess,
  integrationId?: string
) {
  const integrations = await loadEligibleIntegrations(
    tx,
    journey,
    access.userId,
    integrationId ? [integrationId] : undefined
  )
  // The catalog is capped above. Parallel reads share the caller's deadline,
  // and Promise.all preserves the same order during protected output checks.
  return await Promise.all(
    integrations.map((integration) => resolveDestination(integration, access))
  )
}

function ignoreInaccessible(error: unknown): undefined {
  if (
    !(error instanceof Error) ||
    error.message !== 'ACCESS_DENIED_OR_NOT_FOUND'
  )
    throw error
}

/** Return only currently usable saved pairs, without hiding the rest of a draft
 * when a legacy destination has lost access or its provider is unavailable. */
export async function selectedFormDestinations(
  tx: Prisma.TransactionClient,
  journey: { teamId?: string | null },
  blocks: Array<{
    id: string
    typename: string
    type: string | null
    integrationId: string | null
    routeId: string | null
  }>,
  access: DestinationAccess
) {
  const fields = blocks.filter(
    (block) =>
      block.typename === 'TextResponseBlock' &&
      (block.type === 'email' || block.type === 'name')
  )
  const integrationIds = [
    ...new Set(
      fields.flatMap((block) =>
        block.integrationId ? [block.integrationId] : []
      )
    )
  ]
  const destinations = new Map<
    string,
    Awaited<ReturnType<typeof resolveDestination>>
  >()
  if (integrationIds.length) {
    // Leave room for rights checks and settlement in the five-second output call.
    const deadline = AbortSignal.timeout(2000)
    const signal = access.signal
      ? AbortSignal.any([access.signal, deadline])
      : deadline
    const integrations = await loadEligibleIntegrations(
      tx,
      journey,
      access.userId,
      integrationIds
    ).catch(ignoreInaccessible)
    if (integrations && !signal.aborted) {
      const resolved = await Promise.all(
        integrations.map((integration) =>
          resolveDestination(integration, { ...access, signal }).catch(
            ignoreInaccessible
          )
        )
      )
      for (const destination of resolved) {
        if (destination)
          destinations.set(destination.integrationId, destination)
      }
    }
  }
  const selections = new Map<
    string,
    { integrationId: string | null; routeId: string | null }
  >()
  for (const { id, integrationId, routeId } of fields) {
    if (!integrationId) {
      selections.set(id, { integrationId: null, routeId: null })
      continue
    }
    const destination = destinations.get(integrationId)
    if (
      destination &&
      (routeId === null ||
        destination.routes.some((route) => route.id === routeId))
    )
      selections.set(id, { integrationId, routeId })
  }
  return selections
}

/** Check only destinations introduced or restored by this operation. Unrelated
 * legacy configuration remains untouched. The final owning transaction repeats
 * this after its rights/revision locks, including on undo and redo. */
export async function validateFormDestinations(
  tx: Prisma.TransactionClient,
  journey: { teamId?: string | null },
  state: StructureState,
  access?: DestinationAccess
) {
  for (const [id, row] of state.blocks) {
    if (!live(row)) continue
    if (row.typename !== 'TextResponseBlock' || row.integrationId === null)
      continue
    const before = state.originalBlocks.get(id)
    if (
      !state.destinationChecks.has(id) &&
      before?.deletedAt === null &&
      before.integrationId === row.integrationId &&
      before.routeId === row.routeId &&
      before.type === row.type
    )
      continue
    if (!access || !['email', 'name'].includes(requiredString(row.type)))
      throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
    const options = await eligibleDestinations(
      tx,
      journey,
      access,
      requiredString(row.integrationId)
    )
    const destination = options.find(
      (option) => option.integrationId === row.integrationId
    )
    if (
      !destination ||
      (row.routeId !== null &&
        !destination.routes.some((route) => route.id === row.routeId))
    )
      throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  }
}
