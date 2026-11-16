import { AsyncLocalStorage } from 'node:async_hooks'
import { createHash } from 'node:crypto'

import { type Adapter, type AdapterPayload, errors } from 'oidc-provider'

import { type Prisma, type PrismaClient } from '@core/prisma/auth/client'

import { type AuthConfig, environmentBinding } from './config'

export type Database = PrismaClient
export type Transaction = Prisma.TransactionClient
export const transactionScope = new AsyncLocalStorage<Transaction>()
type GateSnapshot = Array<{ id: string; generation: number }>
export const requestGateSnapshots = new AsyncLocalStorage<
  Map<string, GateSnapshot>
>()
export const digest = (value: string): string =>
  createHash('sha256').update(value).digest('hex')

export async function databaseTime(db: Database | Transaction): Promise<Date> {
  const [row] = await db.$queryRaw<
    Array<{ time: Date }>
  >`SELECT clock_timestamp() AS time`
  return row.time
}

export async function assertEnvironment(
  db: Database,
  config: AuthConfig
): Promise<void> {
  const binding = environmentBinding(config)
  await db.authEnvironment.upsert({
    where: { id: 'issuer' },
    create: { id: 'issuer', binding },
    update: {}
  })
  if (
    (await db.authEnvironment.findUniqueOrThrow({ where: { id: 'issuer' } }))
      .binding !== binding
  ) {
    throw new Error('Auth environment mismatch')
  }
}

export async function assertRuntimeRole(db: Database): Promise<void> {
  const [role] = await db.$queryRaw<Array<{ unsafe: boolean }>>`
    SELECT (rolsuper OR rolcreatedb OR rolcreaterole OR rolbypassrls
      OR has_database_privilege(current_user, current_database(), 'CREATE')
      OR has_schema_privilege(current_user, 'public', 'CREATE')
      OR EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND pg_has_role(current_user, tableowner, 'USAGE'))) AS unsafe
    FROM pg_roles WHERE rolname = current_user`
  if (!role || role.unsafe)
    throw new Error('Restricted runtime database role required')
  const [permissions] = await db.$queryRaw<Array<{ allowed: boolean }>>`
    SELECT bool_and(has_table_privilege(current_user, quote_ident(name), privilege)) AS allowed
    FROM unnest(ARRAY['AuthEnvironment', 'OAuthArtifact', 'AgentConnection', 'ConsentReview', 'AuthorizationGate', 'SecurityAudit', 'ReadPermit']) AS tables(name)
    CROSS JOIN unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS privileges(privilege)`
  if (!permissions?.allowed)
    throw new Error('Auth storage permissions unavailable')
}

export type IdentityEvidence = {
  userId: string
  authTime: number
  createdAt: string
}
export type CheckIdentity = (evidence: IdentityEvidence) => Promise<void>

export function connectionGateIds(connection: {
  id: string
  userId: string
  journeyIds: string[]
}): string[] {
  return [
    `account:${connection.userId}`,
    `connection:${connection.id}`,
    ...connection.journeyIds.map((id) => `journey:${id}`)
  ]
}

async function credentialGates(
  db: Database,
  grantId: string
): Promise<GateSnapshot> {
  const existing = requestGateSnapshots.getStore()?.get(grantId)
  if (existing) return existing
  const connection = await db.agentConnection.findUnique({ where: { grantId } })
  if (!connection) throw new errors.InvalidGrant('Consent unavailable')
  const gates = await captureGates(db, connectionGateIds(connection))
  requestGateSnapshots.getStore()?.set(grantId, gates)
  return gates
}

export function adapterFactory(
  db: Database,
  config: AuthConfig,
  checkIdentity: CheckIdentity
) {
  const root = db
  db = new Proxy(root, {
    get(target, property) {
      const current = transactionScope.getStore() ?? target
      const value: unknown = Reflect.get(current, property)
      return typeof value === 'function' ? value.bind(current) : value
    }
  })
  return (model: string): Adapter => {
    async function hydrate(
      row: { payload: Prisma.JsonValue; consumedAt: Date | null } | null
    ): Promise<AdapterPayload | undefined> {
      if (!row) return undefined
      const payload = row.payload as unknown as AdapterPayload
      const grantId = model === 'Grant' ? payload.jti : payload.grantId
      if (
        grantId &&
        ['Grant', 'AccessToken', 'RefreshToken', 'AuthorizationCode'].includes(
          model
        )
      ) {
        const connection = await db.agentConnection.findUnique({
          where: { grantId }
        })
        const now = await databaseTime(db)
        if (
          !connection ||
          connection.revokedAt ||
          connection.expiresAt <= now ||
          connection.environment !== config.AUTH_ENVIRONMENT
        )
          return undefined
        const gates = await credentialGates(root, grantId)
        await checkIdentity({
          userId: connection.userId,
          authTime: connection.firebaseAuthTime,
          createdAt: connection.firebaseCreatedAt
        })
        // Identity lookup may wait on a provider. Recheck durable grant/time
        // afterwards, so that wait cannot admit an expired credential.
        const valid = await root.$transaction(async (transaction) => {
          await lockGates(transaction, gates)
          await transaction.$queryRaw`SELECT id FROM "AgentConnection" WHERE "grantId" = ${grantId} FOR SHARE`
          const current = await transaction.agentConnection.findUnique({
            where: { grantId }
          })
          return (
            current &&
            !current.revokedAt &&
            current.version === connection.version &&
            current.expiresAt > (await databaseTime(transaction))
          )
        })
        if (!valid) return undefined
      }
      return {
        ...payload,
        ...(row.consumedAt
          ? { consumed: Math.floor(row.consumedAt.getTime() / 1000) }
          : {})
      }
    }
    return {
      async upsert(id, payload, expiresIn) {
        if (expiresIn === undefined && model !== 'Client')
          throw new Error('OAuth artifact lifetime required')
        const now = await databaseTime(db)
        const data = {
          payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
          grantId: payload.grantId,
          uid: payload.uid,
          userCode: payload.userCode,
          expiresAt:
            expiresIn === undefined
              ? null
              : new Date(now.getTime() + expiresIn * 1000)
        }
        if (model === 'ReplayDetection') {
          await db.oAuthArtifact.create({ data: { model, id, ...data } })
          return
        }
        const gates =
          payload.grantId &&
          ['AccessToken', 'RefreshToken', 'AuthorizationCode'].includes(model)
            ? await credentialGates(root, payload.grantId)
            : undefined
        const save = async (transaction: Database | Transaction) => {
          if (gates) await lockGates(transaction, gates)
          if (
            payload.grantId &&
            ['AccessToken', 'RefreshToken', 'AuthorizationCode'].includes(model)
          ) {
            await transaction.$queryRaw`SELECT id FROM "AgentConnection" WHERE "grantId" = ${payload.grantId} FOR SHARE`
            const connection = await transaction.agentConnection.findUnique({
              where: { grantId: payload.grantId }
            })
            if (
              !connection ||
              connection.revokedAt ||
              connection.environment !== config.AUTH_ENVIRONMENT ||
              connection.expiresAt <= (await databaseTime(transaction))
            )
              throw new Error('Consent expired')
          }
          await transaction.oAuthArtifact.upsert({
            where: { model_id: { model, id } },
            create: { model, id, ...data },
            update: data
          })
        }
        const transaction = transactionScope.getStore()
        if (transaction) await save(transaction)
        else await root.$transaction(save)
      },
      async find(id) {
        return hydrate(
          await db.oAuthArtifact.findFirst({
            where: {
              model,
              id,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: await databaseTime(db) } }
              ]
            }
          })
        )
      },
      async findByUid(uid) {
        return hydrate(
          await db.oAuthArtifact.findFirst({
            where: {
              model,
              uid,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: await databaseTime(db) } }
              ]
            }
          })
        )
      },
      async findByUserCode(userCode) {
        return hydrate(
          await db.oAuthArtifact.findFirst({
            where: {
              model,
              userCode,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: await databaseTime(db) } }
              ]
            }
          })
        )
      },
      async consume(id) {
        const artifact = await db.oAuthArtifact.findUnique({
          where: { model_id: { model, id } }
        })
        const gates = artifact?.grantId
          ? await credentialGates(root, artifact.grantId)
          : undefined
        await root.$transaction(async (transaction) => {
          if (gates) await lockGates(transaction, gates)
          await transaction.$queryRaw`SELECT id FROM "OAuthArtifact" WHERE model = ${model} AND id = ${id} FOR UPDATE`
          const now = await databaseTime(transaction)
          const result = await transaction.oAuthArtifact.updateMany({
            where: { model, id, consumedAt: null, expiresAt: { gt: now } },
            data: { consumedAt: now }
          })
          if (result.count !== 1)
            throw new errors.InvalidGrant(
              'Credential expired or already consumed'
            )
        })
      },
      async destroy(id) {
        await db.oAuthArtifact.deleteMany({ where: { model, id } })
      },
      async revokeByGrantId(grantId) {
        await db.$transaction(async (transaction) => {
          await transaction.agentConnection.updateMany({
            where: { grantId },
            data: { revokedAt: await databaseTime(transaction) }
          })
          await transaction.oAuthArtifact.deleteMany({ where: { grantId } })
        })
      }
    }
  }
}

export async function captureGates(
  db: Database,
  ids: string[]
): Promise<Array<{ id: string; generation: number }>> {
  const gates = []
  for (const id of [...new Set(ids)].sort()) {
    const gate = await db.authorizationGate.upsert({
      where: { id },
      create: { id },
      update: {}
    })
    if (!gate.open) throw new Error('Authorization unavailable')
    gates.push({ id: gate.id, generation: gate.generation })
  }
  return gates
}

export async function lockGates(
  transaction: Transaction,
  gates: Array<{ id: string; generation: number }>
): Promise<void> {
  for (const gate of [...gates].sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0
  )) {
    const [current] = await transaction.$queryRaw<
      Array<{ generation: number; open: boolean }>
    >`
      SELECT generation, open FROM "AuthorizationGate" WHERE id = ${gate.id} FOR UPDATE`
    if (!current?.open || current.generation !== gate.generation)
      throw new Error('Authorization changed')
  }
}

export type AuditAction =
  | 'authorization'
  | 'consent'
  | 'login'
  | 'token'
  | 'introspection'
  | 'registration'
  | 'read_exchange'
  | 'read_accept'
  | 'output_accept'
export async function audit(
  db: Database | Transaction,
  action: AuditAction,
  outcome: 'allowed' | 'denied',
  identifiers: {
    userId?: string
    clientId?: string
    journeyIds?: string[]
  } = {}
): Promise<void> {
  const now = await databaseTime(db)
  await db.securityAudit.create({
    data: {
      action,
      outcome,
      occurredAt: now,
      expiresAt: new Date(now.getTime() + 90 * 86400000),
      userId: identifiers.userId,
      clientId: identifiers.clientId,
      journeyIds: identifiers.journeyIds ?? []
    }
  })
}

export async function cleanup(db: Database): Promise<void> {
  const now = await databaseTime(db)
  await db.readPermit.deleteMany({
    where: {
      OR: [
        {
          status: 'prepared',
          preparedAt: { lte: new Date(now.getTime() - 86400000) }
        },
        {
          status: 'settled',
          settledAt: { lte: new Date(now.getTime() - 90 * 86400000) }
        }
      ]
    }
  })
  await db.securityAudit.deleteMany({ where: { expiresAt: { lte: now } } })
  await db.consentReview.deleteMany({ where: { validUntil: { lte: now } } })
  await db.oAuthArtifact.deleteMany({ where: { expiresAt: { lte: now } } })
}
