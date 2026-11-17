import { generateKeyPairSync, randomUUID } from 'node:crypto'

import { createAuthDatabase } from '@core/prisma/auth/client'

import { readConfig } from './config'
import { createPermissionAuthority } from './permissions'
import { captureGates, databaseTime, lockGates } from './store'
import { beginConnectionChange } from './withdrawal'

const databaseUrl = process.env.PERMISSIONS_TEST_DATABASE_URL
const journeysSecret = 'permission-journeys-controlled-secret-at-least-32'
const usersSecret = 'permission-users-controlled-secret-at-least-32'

describe('permission change protocol', () => {
  describe.skipIf(!databaseUrl)('durable permission coordinator', () => {
    const db = createAuthDatabase(databaseUrl!)
    const key = generateKeyPairSync('rsa', {
      modulusLength: 2048
    }).privateKey.export({ format: 'jwk' })
    const config = readConfig({
      AUTH_ENVIRONMENT: 'local',
      AUTH_ISSUER: 'http://127.0.0.1:4011',
      AUTH_ADMIN_ORIGIN: 'http://127.0.0.1:4201',
      AUTH_AUDIENCE: 'http://127.0.0.1:4012/mcp',
      AUTH_GATEWAY_URL: 'http://127.0.0.1:4000/graphql',
      AUTH_FIREBASE_PROJECT_ID: 'controlled-permissions',
      AUTH_COOKIE_KEYS: 'controlled-cookie-key-with-at-least-32-characters',
      AUTH_JWKS: JSON.stringify({ keys: [{ ...key, kid: 'permissions' }] }),
      AUTH_INTROSPECTION_CLIENT_ID: 'permissions-client',
      AUTH_INTROSPECTION_CLIENT_SECRET:
        'controlled-introspection-secret-at-least-32',
      AUTH_PERMISSION_JOURNEYS_SECRET: journeysSecret,
      AUTH_PERMISSION_USERS_SECRET: usersSecret,
      PG_DATABASE_URL_AUTH:
        databaseUrl ??
        'postgresql://controlled:controlled@127.0.0.1:5432/permissions'
    })
    const authority = createPermissionAuthority(config, db)
    const prefix = `/internal/permissions/`
    const invoke = (action: string, body: unknown, secret = journeysSecret) =>
      authority(prefix + action, `Bearer ${secret}`, body)
    const changes: string[] = []
    const gateIds: string[] = []
    const connections: string[] = []
    const users: string[] = []
    const change = (ids: string[], intentHash = 'a'.repeat(64)) => {
      const input = { changeId: randomUUID(), gateIds: ids, intentHash }
      changes.push(input.changeId)
      gateIds.push(...ids)
      return input
    }
    const gate = () => `journey:permission-test-${randomUUID()}`
    async function connection(userId = `permission-user-${randomUUID()}`) {
      users.push(userId)
      const now = await databaseTime(db)
      const row = await db.agentConnection.create({
        data: {
          grantId: randomUUID(),
          userId,
          clientId: 'permission-client',
          environment: 'local',
          mode: 'edit',
          journeyIds: [gate()],
          approvedAt: now,
          expiresAt: new Date(now.getTime() + 86400000),
          firebaseAuthTime: 1794777000,
          firebaseCreatedAt: '2026-01-01T00:00:00.000Z'
        }
      })
      connections.push(row.id)
      gateIds.push(`account:${userId}`, `connection:${row.id}`)
      return row
    }
    async function permit(
      connectionId: string,
      ids: string[],
      status = 'accepted'
    ) {
      const gates = await captureGates(db, ids)
      return db.readPermit.create({
        data: {
          connectionId,
          grantVersion: 1,
          requestId: randomUUID(),
          requestHash: 'a'.repeat(64),
          stage: 'read',
          executor: 'journeys',
          executorId: randomUUID(),
          journeyIds: [],
          gates,
          status,
          preparedAt: new Date('2020-01-01T00:00:00.000Z'),
          acceptedAt:
            status === 'accepted' ? new Date('2020-01-01T00:00:00.000Z') : null
        }
      })
    }

    afterEach(async () => {
      await db.readPermit.deleteMany({
        where: { connectionId: { in: connections } }
      })
      await db.connectionHistoryPurge.deleteMany({
        where: { connectionId: { in: connections } }
      })
      await db.connectionChange.deleteMany({
        where: { connectionId: { in: connections } }
      })
      await db.agentConnection.deleteMany({
        where: { id: { in: connections } }
      })
      await db.permissionChange.deleteMany({ where: { id: { in: changes } } })
      await db.authorizationGate.deleteMany({ where: { id: { in: gateIds } } })
      await db.retiredAccount.deleteMany({ where: { userId: { in: users } } })
      connections.length = 0
      changes.length = 0
      gateIds.length = 0
      users.length = 0
    })

    afterAll(() => db.$disconnect())

    it('rejects an ACL snapshot captured before a completed close and reopen', async () => {
      const input = change([gate()])
      const snapshot = await captureGates(db, input.gateIds)
      expect(await invoke('begin', input)).toMatchObject({ status: 'ready' })
      expect(
        await invoke('complete', {
          changeId: input.changeId,
          outcome: 'committed'
        })
      ).toMatchObject({ status: 'complete', outcome: 'committed' })
      await expect(
        db.$transaction((tx) => lockGates(tx, snapshot))
      ).rejects.toThrow('Authorization changed')
      expect(await captureGates(db, input.gateIds)).toEqual([
        { id: input.gateIds[0], generation: snapshot[0].generation + 2 }
      ])
    })

    it('keeps old accepted work pending, cancels prepared work and preserves unrelated work', async () => {
      const owner = await connection()
      const input = change([gate()])
      const independentGate = gate()
      gateIds.push(independentGate)
      const accepted = await permit(owner.id, input.gateIds)
      const prepared = await permit(owner.id, input.gateIds, 'prepared')
      const independent = await permit(owner.id, [independentGate])
      expect(await invoke('begin', input)).toMatchObject({ status: 'pending' })
      expect(
        (await db.readPermit.findUniqueOrThrow({ where: { id: prepared.id } }))
          .status
      ).toBe('cancelled')
      expect(
        await invoke('complete', {
          changeId: input.changeId,
          outcome: 'committed'
        })
      ).toMatchObject({ status: 'pending' })
      expect(
        await invoke('status', { changeId: input.changeId })
      ).toMatchObject({
        status: 'pending'
      })
      expect(
        (
          await db.authorizationGate.findUniqueOrThrow({
            where: { id: input.gateIds[0] }
          })
        ).open
      ).toBe(false)
      await db.readPermit.update({
        where: { id: accepted.id },
        data: { status: 'settled', settledAt: new Date() }
      })
      expect(
        await invoke('status', { changeId: input.changeId })
      ).toMatchObject({
        status: 'ready'
      })
      expect(
        await invoke('complete', {
          changeId: input.changeId,
          outcome: 'committed'
        })
      ).toMatchObject({ status: 'complete' })
      expect(
        (
          await db.readPermit.findUniqueOrThrow({
            where: { id: independent.id }
          })
        ).status
      ).toBe('accepted')
    })

    it('binds exact replay to the original service and intent while serializing overlapping changes', async () => {
      const first = change([gate(), gate()])
      await invoke('begin', first)
      expect(
        await invoke('begin', {
          ...first,
          gateIds: [...first.gateIds].reverse()
        })
      ).toMatchObject({ status: 'ready' })
      await expect(
        invoke('begin', { ...first, intentHash: 'b'.repeat(64) })
      ).rejects.toThrow('Permission intent changed')
      await expect(
        invoke('status', { changeId: first.changeId }, usersSecret)
      ).rejects.toThrow('Access denied')
      const overlapping = change([first.gateIds[0]])
      await expect(invoke('begin', overlapping)).rejects.toThrow(
        'Authorization unavailable'
      )
      await invoke('complete', {
        changeId: first.changeId,
        outcome: 'committed'
      })
      await expect(
        invoke('complete', { changeId: first.changeId, outcome: 'cancelled' })
      ).rejects.toThrow('Permission outcome changed')
      expect(await invoke('begin', overlapping)).toMatchObject({
        status: 'ready'
      })
      await invoke('complete', {
        changeId: overlapping.changeId,
        outcome: 'committed'
      })
    })

    it('keeps a positively cancelled owner mutation failed and closed until its exact intended change commits', async () => {
      const input = change([gate()])
      await invoke('begin', input)
      expect(
        await invoke('complete', {
          changeId: input.changeId,
          outcome: 'cancelled'
        })
      ).toMatchObject({ status: 'failed', outcome: 'cancelled' })
      expect(await invoke('begin', input)).toMatchObject({ status: 'failed' })
      expect(
        await invoke('status', { changeId: input.changeId })
      ).toMatchObject({
        status: 'failed'
      })
      expect(
        (
          await db.permissionChange.findUniqueOrThrow({
            where: { id: input.changeId }
          })
        ).completedAt
      ).toBeNull()
      await expect(captureGates(db, input.gateIds)).rejects.toThrow(
        'Authorization unavailable'
      )
      expect(
        await invoke('complete', {
          changeId: input.changeId,
          outcome: 'committed'
        })
      ).toMatchObject({ status: 'complete', outcome: 'committed' })
      expect(await captureGates(db, input.gateIds)).toHaveLength(1)
    })

    it('retires every connection through a pending access change without reviving it or another user', async () => {
      const first = await connection()
      const second = await connection(first.userId)
      const unrelated = await connection()
      await captureGates(db, [`connection:${first.id}`])
      await db.$transaction(async (tx) => {
        await beginConnectionChange(tx, first, {
          mode: 'view',
          journeyIds: first.journeyIds
        })
      })
      const accepted = await permit(second.id, [
        `account:${first.userId}`,
        `connection:${second.id}`
      ])
      await expect(
        invoke('retire-account', { userId: first.userId })
      ).rejects.toThrow('Access denied')
      expect(
        await invoke('retire-account', { userId: first.userId }, usersSecret)
      ).toEqual({ status: 'pending' })
      expect(
        (
          await db.retiredAccount.findUniqueOrThrow({
            where: { userId: first.userId }
          })
        ).retiredAt
      ).toBeInstanceOf(Date)
      expect(
        await db.agentConnection.count({
          where: { userId: first.userId, revokedAt: null }
        })
      ).toBe(0)
      expect(
        await db.connectionChange.count({
          where: { connectionId: first.id, status: 'superseded' }
        })
      ).toBe(1)
      expect(
        (
          await db.agentConnection.findUniqueOrThrow({
            where: { id: unrelated.id }
          })
        ).revokedAt
      ).toBeNull()
      await expect(
        captureGates(db, [`account:${first.userId}`])
      ).rejects.toThrow('Authorization unavailable')
      await db.readPermit.update({
        where: { id: accepted.id },
        data: { status: 'settled', settledAt: new Date() }
      })
      expect(
        await invoke('retire-account', { userId: first.userId }, usersSecret)
      ).toEqual({ status: 'complete' })
      expect(
        await db.connectionHistoryPurge.count({
          where: { connectionId: { in: [first.id, second.id] } }
        })
      ).toBe(2)
      expect(
        await invoke('retire-account', { userId: first.userId }, usersSecret)
      ).toEqual({ status: 'complete' })
    })

    it('cannot reopen a terminal account when a previous owner policy mutation completes', async () => {
      const owner = await connection()
      const input = change([`account:${owner.userId}`])
      await invoke('begin', input)
      await invoke('retire-account', { userId: owner.userId }, usersSecret)
      await invoke('complete', {
        changeId: input.changeId,
        outcome: 'committed'
      })
      const current = await db.authorizationGate.findUniqueOrThrow({
        where: { id: input.gateIds[0] }
      })
      expect(current.open).toBe(false)
      await expect(captureGates(db, input.gateIds)).rejects.toThrow(
        'Authorization unavailable'
      )
    })
  })
})
