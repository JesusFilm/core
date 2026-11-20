import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

import { initContextCache } from '@pothos/core'
import { GraphQLError, type GraphQLSchema, execute, parse } from 'graphql'
import type { Plugin } from 'graphql-yoga'
import type { Logger } from 'pino'
import { z } from 'zod'

import {
  type Prisma,
  type PrismaClient,
  journeyAfterCommitScope,
  journeyTransactionScope
} from '@core/prisma/journeys/client'
import { prisma as usersDb } from '@core/prisma/users/client'
import { type User, auth } from '@core/yoga/firebaseClient'
import { fingerprint, postJson, serviceUrl } from '@core/yoga/mcp/readContract'

import type { AuthenticatedContext, Context } from '../schema/authScopes'
import { Action, journeyAcl } from '../schema/journey/journey.acl'
import {
  INCLUDE_USER_JOURNEY_ACL,
  UserJourneyAction,
  userJourneyAcl
} from '../schema/userJourney/userJourney.acl'
import {
  INCLUDE_USER_TEAM_ACL,
  Action as UserTeamAction,
  userTeamAcl
} from '../schema/userTeam/userTeam.acl'
import { enqueueJourneyApprovedEmail } from '../workers/email/journeyApproved'
import { enqueueTeamRemovedEmail } from '../workers/email/teamRemoved'
import { enqueueTeamInviteAcceptedEmail } from '../workers/email/teamInviteAccepted'
import { enqueueTemplateSite } from '../workers/plausible/templateSite'
import { enqueueShortLinkDeletes } from '../workers/shortlinkDelete/queue'

import {
  permissionEffectSchema,
  permissionEffectsScope
} from './mcpPermissionEffects'
import {
  deleteUnusedMedia,
  extractCloudflareImageId
} from './mediaCleanup/mediaCleanup'

export interface JourneyPermissionsConfig {
  authorityUrl: string
  authoritySecret: string
}

export function journeyPermissionsEnvironment(
  env: NodeJS.ProcessEnv
): JourneyPermissionsConfig | undefined {
  if (
    env.MCP_READS_ENABLED &&
    !['true', 'false'].includes(env.MCP_READS_ENABLED)
  )
    throw new Error('Invalid read configuration')
  const configured = Boolean(
    env.MCP_READ_AUTHORITY_URL || env.MCP_PERMISSION_AUTHORITY_SECRET
  )
  if (!configured && env.MCP_READS_ENABLED !== 'true') return
  const config = z
    .object({ authorityUrl: serviceUrl, authoritySecret: z.string().min(32) })
    .parse({
      authorityUrl: env.MCP_READ_AUTHORITY_URL,
      authoritySecret: env.MCP_PERMISSION_AUTHORITY_SECRET
    })
  if (config.authoritySecret === env.JOURNEYS_MCP_AUTHORITY_SECRET)
    throw new Error('Separate permission coordination credential required')
  return config
}

// This inventory is the set of cooperative Admin entrypoints. It changes no
// GraphQL shape or Admin role. MCP still cannot invoke these mutations.
export const coordinatedPermissionMutations = [
  'userTeamUpdate',
  'userTeamDelete',
  'userTeamInviteAcceptAll',
  'userJourneyApprove',
  'userJourneyPromote',
  'userJourneyRemove',
  'userJourneyRemoveAll',
  'userInviteAcceptAll',
  'journeyTransferFromAnonymous',
  'journeyPublish',
  'journeyTemplate',
  'journeysArchive',
  'journeysTrash',
  'journeysRestore',
  'journeysDelete',
  'journeyProfileCreate',
  'journeyProfileUpdate',
  'userDeleteJourneysConfirm'
] as const

type MutationName = (typeof coordinatedPermissionMutations)[number]
type MutationArguments = Record<string, unknown>
type OwningDatabase = PrismaClient | Prisma.TransactionClient
interface AffectedResources {
  gateIds: string[]
  journeyIds: string[]
  teamIds: string[]
}

function deny(): never {
  throw new GraphQLError('permission change is not authorized', {
    extensions: { code: 'FORBIDDEN' }
  })
}

function assertAccountCleanupResult(value: unknown): void {
  if (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success !== true
  )
    throw new Error('Account cleanup did not commit')
}

const stringId = (value: unknown): string =>
  z.string().min(1).max(200).parse(value)

/** Discovery never authorizes the later mutation. The existing resolver runs
 * again under owner locks after gates close and accepted work drains.
 */
async function affectedResources(
  db: OwningDatabase,
  field: MutationName,
  args: MutationArguments,
  context: AuthenticatedContext
): Promise<AffectedResources> {
  const journeyIds = new Set<string>()
  const teamIds = new Set<string>()
  const accountIds = new Set<string>([context.user.id])
  const user = context.user
  if (
    (field === 'userDeleteJourneysConfirm' ||
      field === 'journeyTransferFromAnonymous') &&
    !user.email
  )
    deny()
  if (field === 'userTeamUpdate' || field === 'userTeamDelete') {
    const membership = await db.userTeam.findUnique({
      where: { id: stringId(args.id) },
      include: INCLUDE_USER_TEAM_ACL
    })
    if (!membership || !userTeamAcl(UserTeamAction.Update, membership, user))
      deny()
    teamIds.add(membership.teamId)
  } else if (
    field === 'userJourneyApprove' ||
    field === 'userJourneyPromote' ||
    field === 'userJourneyRemove'
  ) {
    const collaborator = await db.userJourney.findUnique({
      where: { id: stringId(args.id) },
      include: INCLUDE_USER_JOURNEY_ACL
    })
    if (
      !collaborator ||
      !userJourneyAcl(UserJourneyAction.UpdateRole, collaborator, user)
    )
      deny()
    journeyIds.add(collaborator.journeyId)
  } else if (field === 'userJourneyRemoveAll') {
    journeyIds.add(stringId(args.id))
  } else if (field === 'userInviteAcceptAll') {
    if (!user.email) deny()
    const invites = await db.userInvite.findMany({
      where: { email: user.email, acceptedAt: null, removedAt: null },
      select: { journeyId: true }
    })
    invites.forEach(({ journeyId }) => journeyIds.add(journeyId))
  } else if (field === 'userTeamInviteAcceptAll') {
    if (!user.email) deny()
    const invites = await db.userTeamInvite.findMany({
      where: { email: user.email, acceptedAt: null, removedAt: null },
      select: { teamId: true }
    })
    invites.forEach(({ teamId }) => teamIds.add(teamId))
  } else if (field === 'journeyTransferFromAnonymous') {
    journeyIds.add(stringId(args.journeyId))
    // The legacy transfer selects a fallback team. Capture all candidates so a
    // change in their membership/order cannot silently select an uncaptured team.
    const memberships = await db.userTeam.findMany({
      where: { userId: user.id },
      select: { teamId: true }
    })
    if (!memberships.length) deny()
    memberships.forEach(({ teamId }) => teamIds.add(teamId))
  } else if (field === 'userDeleteJourneysConfirm') {
    const userId = stringId(args.userId)
    if (userId !== user.id) {
      const caller = await usersDb.user.findUnique({
        where: { userId: user.id },
        select: { superAdmin: true }
      })
      if (!caller?.superAdmin) deny()
    }
    accountIds.add(userId)
    const [collaborations, memberships] = await Promise.all([
      db.userJourney.findMany({
        where: { userId },
        select: { journeyId: true }
      }),
      db.userTeam.findMany({ where: { userId }, select: { teamId: true } })
    ])
    collaborations.forEach(({ journeyId }) => journeyIds.add(journeyId))
    memberships.forEach(({ teamId }) => teamIds.add(teamId))
    const teamJourneys = await db.journey.findMany({
      where: { teamId: { in: [...teamIds] } },
      select: { id: true }
    })
    teamJourneys.forEach(({ id }) => journeyIds.add(id))
  } else if (
    field === 'journeyProfileCreate' ||
    field === 'journeyProfileUpdate'
  ) {
    accountIds.add(user.id)
  } else if (field.startsWith('journeys')) {
    z.array(z.string())
      .parse(args.ids)
      .forEach((id) => journeyIds.add(id))
  } else {
    journeyIds.add(stringId(args.id))
  }
  const journeys = await db.journey.findMany({
    where: { id: { in: [...journeyIds] } },
    include: { userJourneys: true, team: { include: { userTeams: true } } }
  })
  if (
    field === 'userJourneyRemoveAll' &&
    (!journeys[0] || !journeyAcl(Action.Manage, journeys[0], user))
  )
    deny()
  // Batch lifecycle mutations intentionally ignore journeys the caller cannot
  // manage. Close only the resources the existing resolver could change.
  if (field.startsWith('journeys')) {
    journeyIds.clear()
    journeys
      .filter((journey) => journeyAcl(Action.Manage, journey, user))
      .forEach(({ id }) => journeyIds.add(id))
  }
  if (field === 'journeyTransferFromAnonymous') {
    const journey = journeys.find(({ id }) => id === args.journeyId)
    const owner = journey?.userJourneys.find(({ role }) => role === 'owner')
    if (!owner) deny()
    if (owner.userId !== user.id) {
      const ownerUser = await usersDb.user.findFirst({
        where: { userId: owner.userId },
        select: { email: true }
      })
      if (ownerUser?.email != null) deny()
    }
  }
  if (field === 'journeyPublish') {
    if (!journeys[0] || !journeyAcl(Action.Manage, journeys[0], user)) deny()
  }
  if (field === 'journeyTemplate') {
    if (
      !journeys[0] ||
      !journeyAcl(
        journeys[0].teamId === 'jfp-team' ? Action.Manage : Action.Update,
        journeys[0],
        user
      )
    )
      deny()
  }
  journeys
    .filter(({ id }) => journeyIds.has(id))
    .forEach(({ teamId }) => teamIds.add(teamId))
  const gates = [
    ...[...accountIds].map((id) => `account:${id}`),
    ...[...journeyIds].map((id) => `journey:${id}`),
    ...[...teamIds].map((id) => `team:${id}`)
  ].sort()
  return {
    gateIds: gates,
    journeyIds: [...journeyIds].sort(),
    teamIds: [...teamIds].sort()
  }
}

const coordinatorResult = z.object({
  changeId: z.string().uuid(),
  status: z.enum(['pending', 'ready', 'complete', 'failed']),
  outcome: z.enum(['committed', 'cancelled']).optional()
})
const cleanupEffectsSchema = z.object({
  shortLinkIds: z.array(z.string()),
  muxVideoIds: z.array(z.string()),
  cloudflareImageIds: z.array(z.string())
})
const accountCleanupResultSchema = z.object({
  success: z.literal(true),
  deletedJourneyIds: z.array(z.string()),
  deletedTeamIds: z.array(z.string()),
  deletedUserJourneyIds: z.array(z.string()),
  deletedUserTeamIds: z.array(z.string()),
  logs: z.array(
    z.object({
      message: z.string(),
      level: z.preprocess(
        (value) => (typeof value === 'string' ? value.toLowerCase() : value),
        z.enum(['info', 'warn', 'error'])
      ),
      timestamp: z.string()
    })
  )
})
const intentSchema = z.object({
  field: z.enum([...coordinatedPermissionMutations, 'anonymousJourneyCleanup']),
  args: z.record(z.string(), z.unknown()),
  revocationTime: z.string().optional(),
  cleanupEffects: cleanupEffectsSchema.optional(),
  effects: z.array(permissionEffectSchema).optional(),
  accountDeletion: z
    .object({
      userRecordId: z.string().nullable(),
      result: accountCleanupResultSchema.optional()
    })
    .optional()
})
type Intent = z.infer<typeof intentSchema>
type Execution = Prisma.McpPermissionExecutionGetPayload<Record<string, never>>
export interface PermissionActor {
  user: User
  createdAt: string
  revocationTime?: string
}
export type ReadPermissionActor = (userId: string) => Promise<PermissionActor>

async function firebasePermissionActor(
  userId: string
): Promise<PermissionActor> {
  const user = await auth.getUser(userId)
  if (user.disabled) throw new Error('Permission actor disabled')
  return {
    createdAt: user.metadata.creationTime,
    revocationTime: user.tokensValidAfterTime ?? user.metadata.creationTime,
    user: {
      id: user.uid,
      firstName: user.displayName ?? 'Unknown User',
      email: user.email ?? null,
      emailVerified: user.emailVerified,
      imageUrl: user.photoURL ?? null
    }
  }
}

export function createJourneyPermissionCoordinator(
  config: JourneyPermissionsConfig,
  db: PrismaClient,
  logger?: Pick<Logger, 'info'>,
  readActor: ReadPermissionActor = firebasePermissionActor
) {
  const authority = async (action: string, body: unknown) =>
    coordinatorResult.parse(
      await postJson(
        new URL(`/internal/permissions/${action}`, config.authorityUrl).href,
        body,
        `Bearer ${config.authoritySecret}`
      )
    )
  let schema: GraphQLSchema | undefined
  const running = new Set<string>()

  async function currentContext(
    execution: Execution
  ): Promise<AuthenticatedContext> {
    const actor = await readActor(execution.actorId)
    if (
      actor.user.id !== execution.actorId ||
      actor.createdAt !== execution.actorCreatedAt
    )
      throw new Error('Permission actor changed')
    const expectedRevocation = intentSchema.parse(
      execution.intent
    ).revocationTime
    if (expectedRevocation !== actor.revocationTime)
      throw new Error('Permission actor session revoked')
    const role = await db.userRole.findUnique({
      where: { userId: execution.actorId }
    })
    return {
      ...initContextCache(),
      type: 'authenticated',
      user: Object.assign({}, actor.user, { roles: role?.roles ?? [] }),
      currentRoles: role?.roles ?? []
    }
  }

  async function discover(
    database: OwningDatabase,
    intent: Intent,
    context: AuthenticatedContext
  ): Promise<AffectedResources> {
    if (intent.field !== 'anonymousJourneyCleanup')
      return affectedResources(database, intent.field, intent.args, context)
    const args = cleanupIntentSchema.parse(intent.args)
    if (context.user.email)
      throw new Error('Cleanup target is no longer anonymous')
    const projection = await usersDb.user.findUnique({
      where: { userId: args.userId },
      select: { id: true, email: true }
    })
    if (
      !projection ||
      projection.id !== args.userRecordId ||
      projection.email != null
    )
      throw new Error('Cleanup user projection changed')
    const journeys =
      args.kind === 'journey'
        ? await database.journey.findMany({
            where: { id: args.id },
            select: { teamId: true }
          })
        : []
    if (args.kind === 'journey' && journeys.length !== 1)
      throw new GraphQLError('cleanup journey no longer exists', {
        extensions: { code: 'NOT_FOUND' }
      })
    const journeyIds = args.kind === 'journey' ? [args.id] : []
    const teamIds =
      args.kind === 'journey'
        ? journeys.map(({ teamId }) => teamId)
        : args.kind === 'team'
          ? [args.id]
          : (
              await database.userTeam.findMany({
                where: { userId: args.userId },
                select: { teamId: true }
              })
            ).map(({ teamId }) => teamId)
    return {
      journeyIds: journeyIds.sort(),
      teamIds: [...new Set(teamIds)].sort(),
      gateIds: [
        `account:${args.userId}`,
        ...journeyIds.map((id) => `journey:${id}`),
        ...teamIds.map((id) => `team:${id}`)
      ].sort()
    }
  }

  async function report(execution: Execution): Promise<void> {
    const outcome = execution.status === 'committed' ? 'committed' : 'cancelled'
    const result = await authority('complete', {
      changeId: execution.id,
      outcome
    })
    if (execution.status === 'committed') {
      if (result.status !== 'complete' || result.outcome !== 'committed')
        throw new Error('Permission receipt not acknowledged')
      const intent = intentSchema.parse(execution.intent)
      if (intent.field === 'anonymousJourneyCleanup' && intent.cleanupEffects) {
        const args = cleanupIntentSchema.parse(intent.args)
        await enqueueShortLinkDeletes(intent.cleanupEffects.shortLinkIds, true)
        await deleteUnusedMedia(
          {
            muxVideoIds: new Set(intent.cleanupEffects.muxVideoIds),
            cloudflareImageIds: new Set(
              intent.cleanupEffects.cloudflareImageIds
            )
          },
          [args.id],
          args.userId
        )
      }
      for (const [index, effect] of (intent.effects ?? []).entries()) {
        const deliveryId = `permission-${execution.id}-${index}`
        if (effect.type === 'shortLinkDelete')
          await enqueueShortLinkDeletes(effect.shortLinkIds, true)
        else if (effect.type === 'teamRemoved')
          await enqueueTeamRemovedEmail(
            { teamName: effect.teamName, userId: effect.userId },
            deliveryId
          )
        else if (effect.type === 'journeyApproved')
          await enqueueJourneyApprovedEmail(effect.notification, deliveryId)
        else if (effect.type === 'teamInviteAccepted')
          await enqueueTeamInviteAcceptedEmail(effect.notification, deliveryId)
        else await enqueueTemplateSite(effect.templateId, deliveryId)
      }
      await db.mcpPermissionExecution.update({
        where: { id: execution.id },
        data: { reportedAt: new Date() }
      })
    } else if (result.status !== 'failed') {
      throw new Error('Permission failure not acknowledged')
    }
  }

  async function replay(
    intent: Intent,
    context: AuthenticatedContext,
    transaction: Prisma.TransactionClient
  ): Promise<unknown> {
    if (intent.field === 'anonymousJourneyCleanup')
      return executeAnonymousCleanup(transaction, intent.args)
    if (!schema) throw new Error('Permission schema unavailable')
    const field = schema.getMutationType()?.getFields()[intent.field]
    if (!field) throw new Error('Permission field unavailable')
    const variables = field.args.filter(
      ({ name }) => intent.args[name] !== undefined
    )
    const definitions = variables
      .map(({ name, type }) => `$${name}: ${type.toString()}`)
      .join(', ')
    const argumentsList = variables
      .map(({ name }) => `${name}: $${name}`)
      .join(', ')
    const selection =
      intent.field === 'userDeleteJourneysConfirm'
        ? 'success deletedJourneyIds deletedTeamIds deletedUserJourneyIds deletedUserTeamIds logs { message level timestamp }'
        : '__typename'
    const document =
      parse(`mutation PermissionRecovery${definitions ? `(${definitions})` : ''} {
      ${intent.field}${argumentsList ? `(${argumentsList})` : ''} { ${selection} }
    }`)
    const result = await execute({
      schema,
      document,
      variableValues: intent.args,
      contextValue: context
    })
    if (result.errors?.length) throw result.errors[0]
    return intent.field === 'userDeleteJourneysConfirm'
      ? result.data?.[intent.field]
      : result.data
  }

  async function perform<T>(
    id: string,
    operation?: (context: AuthenticatedContext) => Promise<T>
  ): Promise<T | undefined> {
    const execution = await db.mcpPermissionExecution.findUniqueOrThrow({
      where: { id }
    })
    const storedIntent = intentSchema.parse(execution.intent)
    if (
      execution.status === 'committed' &&
      storedIntent.field === 'userDeleteJourneysConfirm'
    ) {
      if (operation)
        await authorizeAccountDeletionResume(execution, storedIntent)
      await report(execution)
      return accountCleanupResultSchema.parse(
        storedIntent.accountDeletion?.result
      ) as T
    }
    const input = {
      changeId: id,
      gateIds: execution.gateIds,
      intentHash: execution.intentHash
    }
    let state: z.infer<typeof coordinatorResult>
    if (execution.gateIds.length <= 1000) {
      state = await authority('begin', input)
    } else {
      const gateIdsHash = fingerprint(execution.gateIds)
      for (let offset = 0; offset < execution.gateIds.length; offset += 250) {
        await authority('begin', {
          ...input,
          gateIds: execution.gateIds.slice(offset, offset + 250),
          page: { offset, gateCount: execution.gateIds.length, gateIdsHash }
        })
      }
      state = await authority('status', { changeId: id })
    }
    if (state.status === 'pending')
      throw new GraphQLError('permission change is pending accepted work', {
        extensions: { code: 'PERMISSION_CHANGE_PENDING', changeId: id }
      })
    if (execution.status === 'committed') {
      await report(execution)
      return
    }
    if (execution.status === 'failed') {
      await report(execution)
      throw new GraphQLError('permission change requires reconciliation', {
        extensions: { code: 'PERMISSION_CHANGE_FAILED', changeId: id }
      })
    }
    const intent = intentSchema.parse(execution.intent)
    try {
      const context = await currentContext(execution)
      const afterCommit: Array<() => Promise<void>> = []
      const output = await db.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM "McpPermissionExecution" WHERE id = ${id} FOR UPDATE`
          const current = await tx.mcpPermissionExecution.findUniqueOrThrow({
            where: { id }
          })
          if (current.status !== 'prepared') return undefined
          const resources = await discover(tx, intent, context)
          if (fingerprint(resources.gateIds) !== fingerprint(execution.gateIds))
            throw new Error('Permission resources changed')
          for (const teamId of resources.teamIds)
            await tx.$queryRaw`SELECT id FROM "Team" WHERE id = ${teamId} FOR UPDATE`
          for (const journeyId of resources.journeyIds)
            await tx.$queryRaw`SELECT id FROM "Journey" WHERE id = ${journeyId} FOR UPDATE`
          const lockedResources = await discover(tx, intent, context)
          if (fingerprint(lockedResources) !== fingerprint(resources))
            throw new Error('Permission resources changed')
          const freshRole = await tx.userRole.findUnique({
            where: { userId: execution.actorId }
          })
          context.currentRoles = freshRole?.roles ?? []
          context.user = Object.assign({}, context.user, {
            roles: context.currentRoles
          })
          if (
            intent.field === 'anonymousJourneyCleanup' &&
            cleanupIntentSchema.parse(intent.args).kind === 'journey'
          )
            intent.cleanupEffects = await captureCleanupEffects(
              tx,
              cleanupIntentSchema.parse(intent.args).id
            )
          if (
            intent.field === 'userDeleteJourneysConfirm' &&
            !intent.accountDeletion
          ) {
            const target = await usersDb.user.findUnique({
              where: { userId: stringId(intent.args.userId) },
              select: { id: true }
            })
            intent.accountDeletion = { userRecordId: target?.id ?? null }
          }
          intent.effects = []
          const value = await permissionEffectsScope.run(intent.effects, () =>
            journeyAfterCommitScope.run(afterCommit, () =>
              journeyTransactionScope.run(tx, () =>
                replayScope.run(id, () =>
                  intent.field === 'anonymousJourneyCleanup'
                    ? executeAnonymousCleanup(tx, intent.args)
                    : operation
                      ? operation(context)
                      : replay(intent, context, tx)
                )
              )
            )
          )
          if (intent.field === 'userDeleteJourneysConfirm') {
            assertAccountCleanupResult(value)
            intent.accountDeletion!.result =
              accountCleanupResultSchema.parse(value)
          }
          await tx.mcpPermissionExecution.update({
            where: { id },
            data: {
              status: 'committed',
              completedAt: new Date(),
              intent: JSON.parse(
                JSON.stringify(intent)
              ) as Prisma.InputJsonValue
            }
          })
          return value
        },
        { isolationLevel: 'Serializable', maxWait: 10000, timeout: 120000 }
      )
      for (const effect of afterCommit) await effect()
      const committed = await db.mcpPermissionExecution.findUniqueOrThrow({
        where: { id }
      })
      await report(committed)
      if (intent.field === 'userDeleteJourneysConfirm') {
        const receipt = intentSchema.parse(committed.intent)
        return accountCleanupResultSchema.parse(
          receipt.accountDeletion?.result
        ) as T
      }
      return output as T | undefined
    } catch (error) {
      // Acquiring the same row lock supplies positive stop evidence. A timeout
      // or missing remote response does not establish whether a commit occurred.
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "McpPermissionExecution" WHERE id = ${id} FOR UPDATE`
        await tx.mcpPermissionExecution.updateMany({
          where: { id, status: 'prepared' },
          data: { status: 'failed', completedAt: new Date() }
        })
      })
      await report(
        await db.mcpPermissionExecution.findUniqueOrThrow({ where: { id } })
      ).catch(() => undefined)
      throw error
    }
  }

  async function authorizeAccountDeletionResume(
    execution: Execution,
    intent: Intent
  ): Promise<void> {
    const context = await currentContext(execution)
    const userId = stringId(intent.args.userId)
    if (!context.user.email) deny()
    const caller = await usersDb.user.findUnique({
      where: { userId: context.user.id },
      select: { superAdmin: true }
    })
    if (userId !== context.user.id && !caller?.superAdmin) deny()
    const target = await usersDb.user.findUnique({
      where: { userId },
      select: { id: true }
    })
    const [collaborations, memberships] = await Promise.all([
      db.userJourney.count({ where: { userId } }),
      db.userTeam.count({ where: { userId } })
    ])
    if (collaborations || memberships)
      throw new Error('Account deletion resources changed')
    if (
      !intent.accountDeletion ||
      (target && target.id !== intent.accountDeletion.userRecordId)
    )
      throw new Error('Account deletion target changed')
  }

  async function submit<T>(
    intent: Intent,
    context: AuthenticatedContext,
    operation?: (context: AuthenticatedContext) => Promise<T>
  ): Promise<T> {
    const actor = await readActor(context.user.id)
    if (actor.user.id !== context.user.id) deny()
    intent = {
      ...intent,
      ...(actor.revocationTime ? { revocationTime: actor.revocationTime } : {})
    }
    const currentRole = await db.userRole.findUnique({
      where: { userId: actor.user.id }
    })
    const resources = await discover(db, intent, {
      ...context,
      user: Object.assign({}, actor.user, { roles: currentRole?.roles ?? [] }),
      currentRoles: currentRole?.roles ?? []
    })
    const intentHash = fingerprint({
      ...intent,
      actorId: actor.user.id,
      actorCreatedAt: actor.createdAt
    })
    const cleanup =
      intent.field === 'anonymousJourneyCleanup'
        ? cleanupIntentSchema.parse(intent.args)
        : undefined
    const activeWhere: Prisma.McpPermissionExecutionWhereInput = cleanup
      ? {
          actorId: actor.user.id,
          actorCreatedAt: actor.createdAt,
          status: { in: ['prepared', 'failed'] },
          AND: [
            { intent: { path: ['field'], equals: 'anonymousJourneyCleanup' } },
            { intent: { path: ['args', 'kind'], equals: cleanup.kind } },
            { intent: { path: ['args', 'id'], equals: cleanup.id } },
            {
              intent: {
                path: ['args', 'userRecordId'],
                equals: cleanup.userRecordId
              }
            }
          ]
        }
      : {
          intentHash,
          status: {
            in:
              intent.field === 'userDeleteJourneysConfirm'
                ? ['prepared', 'failed', 'committed']
                : ['prepared', 'failed']
          }
        }
    const dedupeKey = cleanup
      ? fingerprint({
          actorId: actor.user.id,
          actorCreatedAt: actor.createdAt,
          field: intent.field,
          kind: cleanup.kind,
          id: cleanup.id,
          userRecordId: cleanup.userRecordId
        })
      : intentHash
    const execution = await db.$transaction(async (tx) => {
      // A scheduled worker's moving cutoff does not create another pending
      // executor for the same target. Reuse its original approved payload.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${dedupeKey}, 0))`
      const existing = await tx.mcpPermissionExecution.findFirst({
        where: activeWhere,
        orderBy: { createdAt: 'asc' }
      })
      if (existing) return existing
      // Another exact intent may have completed while this request waited for
      // the advisory lock. Recheck its current rights/resources before creating
      // a new executor or closing any gates.
      const role = await tx.userRole.findUnique({
        where: { userId: actor.user.id }
      })
      const current = await discover(tx, intent, {
        ...context,
        user: Object.assign({}, actor.user, { roles: role?.roles ?? [] }),
        currentRoles: role?.roles ?? []
      })
      if (fingerprint(current) !== fingerprint(resources))
        throw new Error('Permission resources changed before admission')
      return tx.mcpPermissionExecution.create({
        data: {
          id: randomUUID(),
          gateIds: resources.gateIds,
          intentHash,
          intent: JSON.parse(JSON.stringify(intent)) as Prisma.InputJsonValue,
          actorId: actor.user.id,
          actorCreatedAt: actor.createdAt
        }
      })
    })
    const id = execution.id
    running.add(id)
    try {
      return (await perform(id, operation)) as T
    } finally {
      running.delete(id)
    }
  }

  return {
    bindSchema(value: GraphQLSchema) {
      schema = value
    },
    async run<T>(
      field: MutationName,
      args: MutationArguments,
      context: AuthenticatedContext,
      operation: (context: AuthenticatedContext) => Promise<T>
    ): Promise<T> {
      return submit({ field, args }, context, operation)
    },
    async runAnonymousCleanup(
      args: z.infer<typeof cleanupIntentSchema>
    ): Promise<Prisma.BatchPayload> {
      const actor = await readActor(args.userId)
      const context: AuthenticatedContext = {
        ...initContextCache(),
        type: 'authenticated',
        user: actor.user,
        currentRoles: []
      }
      return submit<Prisma.BatchPayload>(
        { field: 'anonymousJourneyCleanup', args },
        context
      )
    },
    async hasCleanupContinuation(
      userId: string,
      userRecordId: string
    ): Promise<boolean> {
      const actor = await readActor(userId)
      if (actor.user.id !== userId || actor.user.email != null) return false
      const projection = await usersDb.user.findUnique({
        where: { userId },
        select: { id: true, email: true }
      })
      if (
        !projection ||
        projection.id !== userRecordId ||
        projection.email != null
      )
        return false
      const previous = await db.mcpPermissionExecution.findFirst({
        where: {
          actorId: userId,
          actorCreatedAt: actor.createdAt,
          status: 'committed',
          AND: [
            { intent: { path: ['field'], equals: 'anonymousJourneyCleanup' } },
            { intent: { path: ['args', 'kind'], equals: 'journey' } },
            { intent: { path: ['args', 'userRecordId'], equals: userRecordId } }
          ]
        }
      })
      if (!previous) return false
      const intent = intentSchema.safeParse(previous.intent)
      return (
        intent.success &&
        intent.data.field === 'anonymousJourneyCleanup' &&
        cleanupIntentSchema.parse(intent.data.args).kind === 'journey' &&
        cleanupIntentSchema.parse(intent.data.args).userRecordId ===
          userRecordId
      )
    },
    async retryFailed(id: string, expectedIntentHash: string): Promise<void> {
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "McpPermissionExecution" WHERE id = ${id} FOR UPDATE`
        const current = await tx.mcpPermissionExecution.findUniqueOrThrow({
          where: { id }
        })
        if (
          current.status !== 'failed' ||
          current.intentHash !== expectedIntentHash
        )
          throw new Error('Permission retry state changed')
        await tx.mcpPermissionExecution.update({
          where: { id },
          data: { status: 'prepared', completedAt: null }
        })
      })
      await perform(id)
    },
    async reconcile(onlyId?: string): Promise<number> {
      let failed = 0
      let after: string | undefined
      while (true) {
        const executions = await db.mcpPermissionExecution.findMany({
          where: {
            reportedAt: null,
            ...(onlyId ? { id: onlyId } : after ? { id: { gt: after } } : {})
          },
          orderBy: { id: 'asc' },
          take: 100
        })
        if (!executions.length) return failed
        after = executions[executions.length - 1].id
        for (const execution of executions) {
          if (running.has(execution.id)) continue
          running.add(execution.id)
          try {
            // A worker knows its named cleanup participant. GraphQL intents
            // are recovered by an API instance with the actual schema bound.
            if (
              !schema &&
              execution.status === 'prepared' &&
              intentSchema.parse(execution.intent).field !==
                'anonymousJourneyCleanup'
            )
              continue
            await perform(execution.id)
          } catch {
            failed++
          } finally {
            running.delete(execution.id)
          }
        }
        if (onlyId) return failed
      }
    },
    pending(failed: number) {
      if (failed)
        logger?.info({ event: 'mcp_permission_reconciliation_pending', failed })
    }
  }
}

const replayScope = new AsyncLocalStorage<string>()
const cleanupIntentSchema = z.object({
  kind: z.enum(['journey', 'memberships', 'team']),
  id: z.string(),
  userId: z.string(),
  userRecordId: z.string(),
  cutoffDate: z.string().datetime()
})
async function captureCleanupEffects(
  db: Prisma.TransactionClient,
  journeyId: string
): Promise<z.infer<typeof cleanupEffectsSchema>> {
  const [links, blocks] = await Promise.all([
    db.qrCode.findMany({ where: { journeyId }, select: { shortLinkId: true } }),
    db.block.findMany({
      where: { journeyId },
      select: { videoId: true, source: true, src: true }
    })
  ])
  return {
    shortLinkIds: links.map(({ shortLinkId }) => shortLinkId),
    muxVideoIds: [
      ...new Set(
        blocks
          .filter(({ source, videoId }) => source === 'mux' && videoId)
          .map(({ videoId }) => videoId!)
      )
    ],
    cloudflareImageIds: [
      ...new Set(
        blocks.flatMap(({ src }) => {
          const id = src ? extractCloudflareImageId(src) : null
          return id ? [id] : []
        })
      )
    ]
  }
}

async function executeAnonymousCleanup(
  db: OwningDatabase,
  input: MutationArguments
): Promise<Prisma.BatchPayload> {
  const args = cleanupIntentSchema.parse(input)
  const currentUser = await usersDb.user.findUnique({
    where: { userId: args.userId },
    select: { id: true, email: true }
  })
  if (
    !currentUser ||
    currentUser.id !== args.userRecordId ||
    currentUser.email != null
  )
    throw new Error('Cleanup target is no longer anonymous')
  if (args.kind === 'journey') {
    await db.journey.delete({
      where: {
        id: args.id,
        createdAt: { lt: new Date(args.cutoffDate) },
        userJourneys: { some: { userId: args.userId, role: 'owner' } }
      }
    })
    return { count: 1 }
  }
  if (args.kind === 'memberships') {
    if (
      await db.journey.count({
        where: {
          userJourneys: { some: { userId: args.userId, role: 'owner' } }
        }
      })
    )
      throw new Error('Cleanup target owns surviving journeys')
    const memberships = await db.userTeam.findMany({
      where: { userId: args.userId },
      select: { teamId: true }
    })
    const result = await db.userTeam.deleteMany({
      where: { userId: args.userId }
    })
    // Preserve the teams through a Pending/recovery boundary: their IDs vanish
    // with the memberships, so remove empty ones under these same team gates.
    await db.team.deleteMany({
      where: {
        id: { in: memberships.map(({ teamId }) => teamId) },
        userTeams: { none: {} }
      }
    })
    return result
  }
  return db.team.deleteMany({ where: { id: args.id, userTeams: { none: {} } } })
}

type Coordinator = ReturnType<typeof createJourneyPermissionCoordinator>
export function coordinateJourneyPermissionMutations(
  schema: GraphQLSchema,
  coordinator: Coordinator
): void {
  const fields = schema.getMutationType()?.getFields()
  if (!fields) throw new Error('Journey mutation schema unavailable')
  coordinator.bindSchema(schema)
  for (const field of coordinatedPermissionMutations) {
    const definition = fields[field]
    const resolve = definition?.resolve
    if (!resolve) throw new Error(`Missing permission mutation: ${field}`)
    definition.resolve = async (
      parent,
      args: MutationArguments,
      context: Context,
      info
    ) => {
      if (context.type !== 'authenticated') deny()
      if (replayScope.getStore()) {
        const value: unknown = await resolve(parent, args, context, info)
        if (field === 'userDeleteJourneysConfirm')
          assertAccountCleanupResult(value)
        return value
      }
      return coordinator.run(
        field,
        args,
        context,
        async (freshContext) => await resolve(parent, args, freshContext, info)
      )
    }
  }
}

export function useJourneyMcpPermissions(coordinator?: Coordinator): Plugin {
  let timer: ReturnType<typeof setInterval> | undefined
  let reconciling = false
  return {
    onYogaInit() {
      if (!coordinator) return
      const recover = async () => {
        if (reconciling) return
        reconciling = true
        try {
          coordinator.pending(await coordinator.reconcile())
        } finally {
          reconciling = false
        }
      }
      void recover().catch(() => undefined)
      timer = setInterval(() => {
        void recover().catch(() => undefined)
      }, 60000)
      timer.unref()
    },
    onDispose() {
      clearInterval(timer)
    }
  }
}
