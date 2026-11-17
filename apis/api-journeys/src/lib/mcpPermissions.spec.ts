import { initContextCache } from '@pothos/core'
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  execute,
  parse
} from 'graphql'
import { mockDeep } from 'vitest-mock-extended'

import {
  type Prisma,
  type PrismaClient,
  deferJourneyTransactionEffect,
  journeyTransactionScope,
  transactionScopedJourneyClient
} from '@core/prisma/journeys/client'
import { prisma as usersDb } from '@core/prisma/users/client'

import type { AuthenticatedContext } from '../schema/authScopes'
import { enqueueShortLinkDeletes } from '../workers/shortlinkDelete/queue'

import {
  type PermissionActor,
  coordinateJourneyPermissionMutations,
  coordinatedPermissionMutations,
  createJourneyPermissionCoordinator,
  journeyPermissionsEnvironment
} from './mcpPermissions'
import { deleteUnusedMedia } from './mediaCleanup/mediaCleanup'

vi.mock('@core/prisma/users/client', () => ({
  prisma: { user: { findUnique: vi.fn(), findFirst: vi.fn() } }
}))
vi.mock('../workers/shortlinkDelete/queue', () => ({
  enqueueShortLinkDeletes: vi.fn(async () => undefined)
}))
vi.mock('./mediaCleanup/mediaCleanup', async () => ({
  ...(await vi.importActual('./mediaCleanup/mediaCleanup')),
  deleteUnusedMedia: vi.fn(async () => ({
    deletedMuxVideos: 0,
    deletedCloudflareImages: 0
  }))
}))

type Execution = Prisma.McpPermissionExecutionGetPayload<Record<string, never>>
const context: AuthenticatedContext = {
  ...initContextCache(),
  type: 'authenticated',
  user: {
    id: 'manager',
    firstName: 'Manager',
    email: 'manager@example.com',
    emailVerified: true
  },
  currentRoles: []
}
const actor: PermissionActor = {
  user: context.user,
  createdAt: '2026-01-01T00:00:00Z'
}
const config = {
  authorityUrl: 'http://localhost:4011',
  authoritySecret: 'p'.repeat(32)
}

function prismaResult<T>(value: T): Prisma.PrismaPromise<T> {
  return Object.defineProperty(Promise.resolve(value), Symbol.toStringTag, {
    value: 'PrismaPromise'
  }) as Prisma.PrismaPromise<T>
}

function fixture() {
  const raw = mockDeep<PrismaClient>()
  const db = raw
  const rows = new Map<string, Execution>()
  vi.mocked(usersDb.user.findUnique).mockResolvedValue({
    email: null
  } as Awaited<ReturnType<typeof usersDb.user.findUnique>>)
  vi.mocked(usersDb.user.findFirst).mockResolvedValue({
    email: 'verified-owner@example.com'
  } as Awaited<ReturnType<typeof usersDb.user.findFirst>>)
  vi.mocked(enqueueShortLinkDeletes).mockReset().mockResolvedValue(undefined)
  vi.mocked(deleteUnusedMedia)
    .mockReset()
    .mockResolvedValue({ deletedMuxVideos: 0, deletedCloudflareImages: 0 })
  raw.$transaction.mockImplementation((async (operation: unknown) =>
    typeof operation === 'function'
      ? operation(raw)
      : Promise.all(
          operation as Promise<unknown>[]
        )) as typeof raw.$transaction)
  raw.$queryRaw.mockResolvedValue([])
  raw.$executeRaw.mockResolvedValue(0)
  raw.block.findMany.mockResolvedValue([])
  raw.qrCode.findMany.mockResolvedValue([])
  raw.mcpPermissionExecution.findFirst.mockImplementation(({ where } = {}) =>
    prismaResult(
      [...rows.values()].find(
        (row) =>
          row.intentHash === where?.intentHash &&
          ['prepared', 'failed'].includes(row.status)
      ) ?? null
    )
  )
  raw.journey.findMany.mockResolvedValue([])
  raw.userRole.findUnique.mockResolvedValue(null)
  raw.mcpPermissionExecution.create.mockImplementation(({ data }) => {
    const row = {
      ...data,
      createdAt: new Date(),
      completedAt: null,
      reportedAt: null,
      status: 'prepared'
    } as Execution
    rows.set(row.id, row)
    return prismaResult(row)
  })
  raw.mcpPermissionExecution.findUniqueOrThrow.mockImplementation(
    ({ where }) => {
      const row = rows.get(String(where.id))
      if (!row) throw new Error('No execution')
      return prismaResult(row)
    }
  )
  raw.mcpPermissionExecution.findMany.mockImplementation(({ where } = {}) =>
    prismaResult(
      [...rows.values()]
        .filter(({ id, reportedAt }) => {
          if (reportedAt) return false
          if (typeof where?.id === 'string') return id === where.id
          if (
            where?.id &&
            typeof where.id === 'object' &&
            typeof where.id.gt === 'string'
          )
            return id > where.id.gt
          return true
        })
        .sort((left, right) => left.id.localeCompare(right.id))
    )
  )
  raw.mcpPermissionExecution.update.mockImplementation(({ where, data }) => {
    const row = rows.get(String(where.id))!
    Object.assign(row, data)
    return prismaResult(row)
  })
  raw.mcpPermissionExecution.updateMany.mockImplementation(
    ({ where, data }) => {
      const row = rows.get(typeof where?.id === 'string' ? where.id : '')
      if (!row || row.status !== where?.status)
        return prismaResult({ count: 0 })
      Object.assign(row, data)
      return prismaResult({ count: 1 })
    }
  )
  raw.userTeam.findUnique.mockResolvedValue({
    id: 'membership',
    userId: 'member',
    teamId: 'team',
    role: 'member',
    team: { id: 'team', userTeams: [{ userId: 'manager', role: 'manager' }] }
  } as unknown as Awaited<ReturnType<PrismaClient['userTeam']['findUnique']>>)
  let status = 'ready'
  let failReports = false
  const requests: Array<{ action: string; body: Record<string, unknown> }> = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, request: RequestInit) => {
      const action = new URL(url).pathname.split('/').at(-1)!
      const body = JSON.parse(
        typeof request.body === 'string' ? request.body : '{}'
      ) as Record<string, unknown>
      requests.push({ action, body })
      if (action === 'complete' && failReports)
        throw new Error('Report unavailable')
      return Response.json({
        changeId: body.changeId,
        status:
          action === 'complete'
            ? body.outcome === 'committed'
              ? 'complete'
              : 'failed'
            : status,
        ...(action === 'complete' ? { outcome: body.outcome } : {})
      })
    })
  )
  const readActor = vi.fn(async () => actor)
  const coordinator = createJourneyPermissionCoordinator(
    config,
    db,
    undefined,
    readActor
  )
  const writes = vi.fn(async () => ({ value: 'changed' }))
  const Result = new GraphQLObjectType({
    name: 'PermissionResult',
    fields: { value: { type: GraphQLString } }
  })
  function schemaFor(value = coordinator) {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: { ok: { type: GraphQLString } }
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: Object.fromEntries(
          coordinatedPermissionMutations.map((name) => [
            name,
            {
              type: Result,
              args: { id: { type: GraphQLString } },
              resolve: writes
            }
          ])
        )
      })
    })
    coordinateJourneyPermissionMutations(schema, value)
    return schema
  }
  return {
    raw,
    db,
    rows,
    coordinator,
    readActor,
    requests,
    writes,
    schemaFor,
    setPending: () => {
      status = 'pending'
    },
    setReady: () => {
      status = 'ready'
    },
    failReports: () => {
      failReports = true
    },
    restoreReports: () => {
      failReports = false
    }
  }
}

describe('cooperative permission mutations', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('requires the separate coordinator credential when reads are enabled', () => {
    expect(journeyPermissionsEnvironment({ NODE_ENV: 'test' })).toBeUndefined()
    expect(() =>
      journeyPermissionsEnvironment({
        NODE_ENV: 'test',
        MCP_READS_ENABLED: 'true'
      })
    ).toThrow()
    expect(() =>
      journeyPermissionsEnvironment({
        NODE_ENV: 'test',
        MCP_READS_ENABLED: 'true',
        MCP_READ_AUTHORITY_URL: config.authorityUrl,
        MCP_PERMISSION_AUTHORITY_SECRET: config.authoritySecret,
        JOURNEYS_MCP_AUTHORITY_SECRET: config.authoritySecret
      })
    ).toThrow('Separate')
  })

  it('checks current Admin authority before closing any gate', async () => {
    const f = fixture()
    f.raw.userTeam.findUnique.mockResolvedValue(null)
    await expect(
      f.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        f.writes
      )
    ).rejects.toThrow('not authorized')
    expect(f.requests).toEqual([])
    expect(f.rows.size).toBe(0)
    expect(f.writes).not.toHaveBeenCalled()
  })

  it('commits the original resolver and its receipt after drain then reports completion', async () => {
    const f = fixture()
    await f.coordinator.run(
      'userTeamUpdate',
      { id: 'membership' },
      context,
      f.writes
    )
    expect(f.requests.map(({ action }) => action)).toEqual([
      'begin',
      'complete'
    ])
    expect(f.requests[0].body.gateIds).toEqual(['account:manager', 'team:team'])
    expect([...f.rows.values()][0]).toMatchObject({
      status: 'committed',
      actorId: 'manager'
    })
    expect([...f.rows.values()][0].reportedAt).toBeInstanceOf(Date)
    expect(f.writes).toHaveBeenCalledOnce()
    expect(f.raw.$queryRaw).toHaveBeenCalled()
  })

  it('keeps an approved intent pending and replays exactly its one field after restart', async () => {
    const f = fixture()
    f.setPending()
    const result = await execute({
      schema: f.schemaFor(),
      document: parse('mutation {userTeamUpdate(id:"membership"){value}}'),
      contextValue: context
    })
    expect(result.errors?.[0].extensions.code).toBe('PERMISSION_CHANGE_PENDING')
    expect(f.writes).not.toHaveBeenCalled()
    expect([...f.rows.values()][0].status).toBe('prepared')
    expect(f.requests.some(({ action }) => action === 'complete')).toBe(false)
    const restarted = createJourneyPermissionCoordinator(
      config,
      f.db,
      undefined,
      f.readActor
    )
    expect(await restarted.reconcile()).toBe(0)
    expect([...f.rows.values()][0].status).toBe('prepared')
    f.schemaFor(restarted)
    f.setReady()
    expect(await restarted.reconcile()).toBe(0)
    expect(f.writes).toHaveBeenCalledOnce()
    expect([...f.rows.values()][0].status).toBe('committed')
    expect(await restarted.reconcile()).toBe(0)
    expect(f.writes).toHaveBeenCalledOnce()
  })

  it('retries a lost completion report without repeating the committed mutation', async () => {
    const f = fixture()
    f.failReports()
    await expect(
      f.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        f.writes
      )
    ).rejects.toThrow('Report unavailable')
    expect([...f.rows.values()][0].status).toBe('committed')
    expect(f.writes).toHaveBeenCalledOnce()
    f.restoreReports()
    expect(await f.coordinator.reconcile()).toBe(0)
    expect(f.writes).toHaveBeenCalledOnce()
    expect([...f.rows.values()][0].reportedAt).toBeInstanceOf(Date)
  })

  it('positively fences a failed mutation and keeps its gates closed for operator reconciliation', async () => {
    const f = fixture()
    f.writes.mockRejectedValue(new Error('Owner mutation failed'))
    await expect(
      f.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        f.writes
      )
    ).rejects.toThrow('Owner mutation failed')
    expect([...f.rows.values()][0]).toMatchObject({
      status: 'failed',
      reportedAt: null
    })
    expect(f.requests.at(-1)).toMatchObject({
      action: 'complete',
      body: { outcome: 'cancelled' }
    })
    expect(await f.coordinator.reconcile()).toBe(1)
    expect(f.writes).toHaveBeenCalledOnce()
  })

  it('does not execute pending authority for a deleted and recreated actor', async () => {
    const f = fixture()
    f.schemaFor()
    f.setPending()
    await expect(
      f.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        f.writes
      )
    ).rejects.toMatchObject({
      extensions: { code: 'PERMISSION_CHANGE_PENDING' }
    })
    f.readActor.mockResolvedValue({
      ...actor,
      createdAt: '2026-11-17T00:00:00Z'
    })
    f.setReady()
    expect(await f.coordinator.reconcile()).toBe(1)
    expect([...f.rows.values()][0].status).toBe('failed')
    expect(f.writes).not.toHaveBeenCalled()
  })

  it('fails closed when fresh actor eligibility is unavailable after gate closure', async () => {
    const f = fixture()
    f.readActor
      .mockResolvedValueOnce(actor)
      .mockRejectedValue(new Error('Firebase unavailable'))
    await expect(
      f.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        f.writes
      )
    ).rejects.toThrow('Firebase unavailable')
    expect([...f.rows.values()][0].status).toBe('failed')
    expect(f.writes).not.toHaveBeenCalled()
    expect(f.requests.at(-1)?.body.outcome).toBe('cancelled')
  })

  it('does not replay an approved human intent after Firebase sign-in revocation', async () => {
    const f = fixture()
    f.schemaFor()
    f.readActor.mockResolvedValue({
      ...actor,
      revocationTime: '2026-01-01T00:00:00Z'
    })
    f.setPending()
    await expect(
      f.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        f.writes
      )
    ).rejects.toMatchObject({
      extensions: { code: 'PERMISSION_CHANGE_PENDING' }
    })
    f.readActor.mockResolvedValue({
      ...actor,
      revocationTime: '2026-11-17T00:00:00Z'
    })
    f.setReady()
    expect(await f.coordinator.reconcile()).toBe(1)
    expect([...f.rows.values()][0].status).toBe('failed')
    expect(f.writes).not.toHaveBeenCalled()
  })

  it('resumes the same failed intent only through an explicit matching operator retry', async () => {
    const f = fixture()
    f.schemaFor()
    f.writes.mockRejectedValueOnce(new Error('Owner temporarily unavailable'))
    await expect(
      f.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        f.writes
      )
    ).rejects.toThrow('temporarily unavailable')
    const row = [...f.rows.values()][0]
    await expect(
      f.coordinator.retryFailed(row.id, 'wrong hash')
    ).rejects.toThrow('state changed')
    expect(row.status).toBe('failed')
    await f.coordinator.retryFailed(row.id, row.intentHash)
    expect(f.writes).toHaveBeenCalledTimes(2)
    expect(row.status).toBe('committed')
    await expect(
      f.coordinator.retryFailed(row.id, row.intentHash)
    ).rejects.toThrow('state changed')
    expect(f.writes).toHaveBeenCalledTimes(2)
  })

  it('replays the anonymous cleanup worker participant after accepted work settles', async () => {
    const f = fixture()
    f.readActor.mockResolvedValue({
      ...actor,
      user: { ...actor.user, email: null }
    })
    f.raw.journey.findMany.mockResolvedValue([
      { id: 'old-journey', teamId: 'old-team' }
    ] as unknown as Awaited<ReturnType<PrismaClient['journey']['findMany']>>)
    f.setPending()
    await expect(
      f.coordinator.runAnonymousCleanup({
        kind: 'journey',
        id: 'old-journey',
        userId: 'manager',
        cutoffDate: '2026-11-01T00:00:00Z'
      })
    ).rejects.toMatchObject({
      extensions: { code: 'PERMISSION_CHANGE_PENDING' }
    })
    expect(f.writes).not.toHaveBeenCalled()
    expect(f.raw.journey.delete).not.toHaveBeenCalled()
    f.setReady()
    const transactionalDelete = vi.fn(async () => ({ id: 'old-journey' }))
    const tx = {
      mcpPermissionExecution: f.raw.mcpPermissionExecution,
      userRole: f.raw.userRole,
      qrCode: f.raw.qrCode,
      block: f.raw.block,
      journey: {
        findMany: f.raw.journey.findMany,
        delete: transactionalDelete
      },
      $queryRaw: f.raw.$queryRaw
    } as unknown as Prisma.TransactionClient
    f.raw.$transaction.mockImplementation((async (operation: unknown) =>
      typeof operation === 'function'
        ? operation(tx)
        : Promise.all(
            operation as Promise<unknown>[]
          )) as typeof f.raw.$transaction)
    const restarted = createJourneyPermissionCoordinator(
      config,
      f.db,
      undefined,
      f.readActor
    )
    expect(await restarted.reconcile()).toBe(0)
    expect(f.raw.journey.delete).not.toHaveBeenCalled()
    expect(transactionalDelete).toHaveBeenCalledWith({
      where: {
        id: 'old-journey',
        createdAt: { lt: new Date('2026-11-01T00:00:00Z') },
        userJourneys: { some: { userId: 'manager', role: 'owner' } }
      }
    })
    expect([...f.rows.values()][0].status).toBe('committed')
  })

  it('does not recover anonymous cleanup against an account converted to a real user', async () => {
    const f = fixture()
    f.readActor.mockResolvedValue({
      ...actor,
      user: { ...actor.user, email: null }
    })
    f.raw.journey.findMany.mockResolvedValue([
      { id: 'old-journey', teamId: 'old-team' }
    ] as unknown as Awaited<ReturnType<PrismaClient['journey']['findMany']>>)
    f.setPending()
    await expect(
      f.coordinator.runAnonymousCleanup({
        kind: 'journey',
        id: 'old-journey',
        userId: 'manager',
        cutoffDate: '2026-11-01T00:00:00Z'
      })
    ).rejects.toThrow('pending accepted work')
    f.readActor.mockResolvedValue(actor)
    f.setReady()
    expect(await f.coordinator.reconcile()).toBe(1)
    expect(f.raw.journey.delete).not.toHaveBeenCalled()
    expect([...f.rows.values()][0].status).toBe('failed')
  })

  it('runs existing shortlink side effects only after the outer receipt commits', async () => {
    const f = fixture()
    const effect = vi.fn(async () => {
      expect([...f.rows.values()][0].status).toBe('committed')
    })
    await f.coordinator.run(
      'userTeamUpdate',
      { id: 'membership' },
      context,
      async () => {
        expect(deferJourneyTransactionEffect(effect)).toBe(true)
        expect(effect).not.toHaveBeenCalled()
        return { value: 'changed' }
      }
    )
    expect(effect).toHaveBeenCalledOnce()
    const failed = fixture()
    const cancelledEffect = vi.fn(async () => undefined)
    await expect(
      failed.coordinator.run(
        'userTeamUpdate',
        { id: 'membership' },
        context,
        async () => {
          deferJourneyTransactionEffect(cancelledEffect)
          throw new Error('Mutation rolled back')
        }
      )
    ).rejects.toThrow('rolled back')
    expect(cancelledEffect).not.toHaveBeenCalled()
  })

  it('joins nested resolver transactions and their model writes to the receipt transaction', async () => {
    const rootUpdate = vi.fn(async () => ({ id: 'root' }))
    const nestedUpdate = vi.fn(async () => ({ id: 'transaction' }))
    const rootTransaction = vi.fn()
    const scoped = transactionScopedJourneyClient({
      journey: { update: rootUpdate },
      $transaction: rootTransaction
    } as unknown as PrismaClient)
    const tx = {
      journey: { update: nestedUpdate }
    } as unknown as Prisma.TransactionClient
    await journeyTransactionScope.run(tx, async () => {
      expect(
        await scoped.journey.update({
          where: { id: 'journey' },
          data: { title: 'changed' }
        })
      ).toEqual({ id: 'transaction' })
      await scoped.$transaction(async (inner) =>
        inner.journey.update({
          where: { id: 'journey' },
          data: { title: 'second' }
        })
      )
      await scoped.$transaction([
        scoped.journey.update({
          where: { id: 'journey' },
          data: { title: 'third' }
        })
      ])
    })
    expect(nestedUpdate).toHaveBeenCalledTimes(3)
    expect(rootUpdate).not.toHaveBeenCalled()
    expect(rootTransaction).not.toHaveBeenCalled()
    await scoped.journey.update({
      where: { id: 'journey' },
      data: { title: 'normal' }
    })
    expect(rootUpdate).toHaveBeenCalledOnce()
  })

  it('keeps coordination active on write-only replicas and rejects incomplete or invalid configuration', () => {
    expect(
      journeyPermissionsEnvironment({
        NODE_ENV: 'test',
        MCP_READS_ENABLED: 'false',
        MCP_READ_AUTHORITY_URL: config.authorityUrl,
        MCP_PERMISSION_AUTHORITY_SECRET: config.authoritySecret
      })
    ).toEqual(config)
    expect(
      journeyPermissionsEnvironment({
        NODE_ENV: 'test',
        MCP_READ_AUTHORITY_URL: config.authorityUrl,
        MCP_PERMISSION_AUTHORITY_SECRET: config.authoritySecret
      })
    ).toEqual(config)
    expect(() =>
      journeyPermissionsEnvironment({
        NODE_ENV: 'test',
        MCP_READS_ENABLED: 'false',
        MCP_READ_AUTHORITY_URL: config.authorityUrl
      })
    ).toThrow()
    expect(() =>
      journeyPermissionsEnvironment({
        NODE_ENV: 'test',
        MCP_READS_ENABLED: 'false',
        MCP_PERMISSION_AUTHORITY_SECRET: config.authoritySecret
      })
    ).toThrow()
    expect(() =>
      journeyPermissionsEnvironment({
        NODE_ENV: 'test',
        MCP_READS_ENABLED: 'invalid'
      })
    ).toThrow('Invalid read')
  })

  it('fences an empty invitation discovery before a later lookup can alter a membership', async () => {
    const f = fixture()
    f.raw.userTeamInvite.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ teamId: 'new-team' }] as unknown as Awaited<
        ReturnType<PrismaClient['userTeamInvite']['findMany']>
      >)
    await expect(
      f.coordinator.run('userTeamInviteAcceptAll', {}, context, f.writes)
    ).rejects.toThrow('resources changed')
    expect(f.requests[0].body.gateIds).toEqual(['account:manager'])
    expect(f.writes).not.toHaveBeenCalled()
    expect([...f.rows.values()][0].status).toBe('failed')
  })

  it('reuses an identical active intent when a normal Admin caller retries Pending', async () => {
    const f = fixture()
    f.setPending()
    let firstId: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await f.coordinator.run(
          'userTeamDelete',
          { id: 'membership' },
          context,
          f.writes
        )
      } catch (error) {
        expect(error).toMatchObject({
          extensions: { code: 'PERMISSION_CHANGE_PENDING' }
        })
        const id = (error as { extensions: { changeId: string } }).extensions
          .changeId
        if (!attempt) firstId = id
        else expect(id).toBe(firstId)
      }
    }
    expect(f.rows.size).toBe(1)
    expect(f.raw.$executeRaw).toHaveBeenCalledTimes(2)
    f.setReady()
    const restarted = createJourneyPermissionCoordinator(
      config,
      f.db,
      undefined,
      f.readActor
    )
    f.schemaFor(restarted)
    expect(await restarted.reconcile()).toBe(0)
    expect(f.writes).toHaveBeenCalledOnce()
    expect(f.rows.size).toBe(1)
    expect([...f.rows.values()][0].reportedAt).toBeInstanceOf(Date)
  })

  it('rejects transfer of a verified owner journey before closing any victim gate', async () => {
    const f = fixture()
    f.raw.userTeam.findMany.mockResolvedValue([
      { teamId: 'own-team' }
    ] as unknown as Awaited<ReturnType<PrismaClient['userTeam']['findMany']>>)
    f.raw.journey.findMany.mockResolvedValue([
      {
        id: 'victim-journey',
        teamId: 'victim-team',
        userJourneys: [{ userId: 'victim', role: 'owner' }],
        team: { id: 'victim-team', userTeams: [] }
      }
    ] as unknown as Awaited<ReturnType<PrismaClient['journey']['findMany']>>)
    await expect(
      f.coordinator.run(
        'journeyTransferFromAnonymous',
        { journeyId: 'victim-journey', teamId: 'foreign-team' },
        context,
        f.writes
      )
    ).rejects.toThrow('not authorized')
    expect(f.rows.size).toBe(0)
    expect(f.requests).toEqual([])
    expect(f.writes).not.toHaveBeenCalled()
  })

  it('captures only eligible transfer fallback teams when a supplied destination is foreign', async () => {
    const f = fixture()
    f.raw.userTeam.findMany.mockResolvedValue([
      { teamId: 'own-team' }
    ] as unknown as Awaited<ReturnType<PrismaClient['userTeam']['findMany']>>)
    f.raw.journey.findMany.mockResolvedValue([
      {
        id: 'old-journey',
        teamId: 'old-team',
        userJourneys: [{ userId: 'anonymous-owner', role: 'owner' }],
        team: { id: 'old-team', userTeams: [] }
      }
    ] as unknown as Awaited<ReturnType<PrismaClient['journey']['findMany']>>)
    vi.mocked(usersDb.user.findFirst).mockResolvedValue({
      email: null
    } as Awaited<ReturnType<typeof usersDb.user.findFirst>>)
    await f.coordinator.run(
      'journeyTransferFromAnonymous',
      { journeyId: 'old-journey', teamId: 'foreign-team' },
      context,
      f.writes
    )
    expect(f.requests[0].body.gateIds).toEqual([
      'account:manager',
      'journey:old-journey',
      'team:old-team',
      'team:own-team'
    ])
    expect(f.writes).toHaveBeenCalledOnce()
  })

  it('retains anonymous cleanup effects in its committed receipt until postcommit recovery finishes', async () => {
    const f = fixture()
    f.readActor.mockResolvedValue({
      ...actor,
      user: { ...actor.user, email: null }
    })
    f.raw.journey.findMany.mockResolvedValue([
      { id: 'old-journey', teamId: 'old-team' }
    ] as unknown as Awaited<ReturnType<PrismaClient['journey']['findMany']>>)
    f.raw.qrCode.findMany.mockResolvedValue([
      { shortLinkId: 'short-link' }
    ] as unknown as Awaited<ReturnType<PrismaClient['qrCode']['findMany']>>)
    f.raw.block.findMany.mockResolvedValue([
      {
        source: 'mux',
        videoId: 'video',
        src: 'https://imagedelivery.net/hash/image/public'
      }
    ] as unknown as Awaited<ReturnType<PrismaClient['block']['findMany']>>)
    vi.mocked(enqueueShortLinkDeletes).mockRejectedValue(
      new Error('Shortlink service unavailable')
    )
    await expect(
      f.coordinator.runAnonymousCleanup({
        kind: 'journey',
        id: 'old-journey',
        userId: 'manager',
        cutoffDate: '2026-11-01T00:00:00Z'
      })
    ).rejects.toThrow('Shortlink service unavailable')
    const row = [...f.rows.values()][0]
    expect(row).toMatchObject({
      status: 'committed',
      reportedAt: null,
      intent: {
        cleanupEffects: {
          shortLinkIds: ['short-link'],
          muxVideoIds: ['video'],
          cloudflareImageIds: ['image']
        }
      }
    })
    expect(f.raw.journey.delete).toHaveBeenCalledOnce()
    vi.mocked(enqueueShortLinkDeletes).mockResolvedValue(undefined)
    const restarted = createJourneyPermissionCoordinator(
      config,
      f.db,
      undefined,
      f.readActor
    )
    expect(await restarted.reconcile()).toBe(0)
    expect(f.raw.journey.delete).toHaveBeenCalledOnce()
    expect(enqueueShortLinkDeletes).toHaveBeenLastCalledWith(['short-link'])
    expect(deleteUnusedMedia).toHaveBeenCalledWith(
      {
        muxVideoIds: new Set(['video']),
        cloudflareImageIds: new Set(['image'])
      },
      ['old-journey'],
      'manager'
    )
    expect(row.reportedAt).toBeInstanceOf(Date)
  })

  it('checks authenticated-only scopes before closing shared account deletion or transfer gates', async () => {
    for (const field of [
      'userDeleteJourneysConfirm',
      'journeyTransferFromAnonymous'
    ] as const) {
      const f = fixture()
      f.readActor.mockResolvedValue({
        ...actor,
        user: { ...actor.user, email: null }
      })
      await expect(
        f.coordinator.run(
          field,
          { userId: 'manager', journeyId: 'journey' },
          context,
          f.writes
        )
      ).rejects.toThrow('not authorized')
      expect(f.rows.size).toBe(0)
      expect(f.requests).toEqual([])
      expect(f.writes).not.toHaveBeenCalled()
    }
  })

  it('mirrors the global template management check before closing the global team gate', async () => {
    const f = fixture()
    f.raw.journey.findMany.mockResolvedValue([
      {
        id: 'global-journey',
        teamId: 'jfp-team',
        template: false,
        userJourneys: [{ userId: 'manager', role: 'editor' }],
        team: { id: 'jfp-team', userTeams: [] }
      }
    ] as unknown as Awaited<ReturnType<PrismaClient['journey']['findMany']>>)
    await expect(
      f.coordinator.run(
        'journeyTemplate',
        { id: 'global-journey', input: { template: true } },
        context,
        f.writes
      )
    ).rejects.toThrow('not authorized')
    expect(f.rows.size).toBe(0)
    expect(f.requests).toEqual([])
    expect(f.writes).not.toHaveBeenCalled()
  })
})
