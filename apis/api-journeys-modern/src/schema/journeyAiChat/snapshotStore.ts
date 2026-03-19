import Redis from 'ioredis'

import type { PlanOperation } from '@core/shared/ai/agentJourneyTypes'
import type { JourneySimple } from '@core/shared/ai/journeySimpleTypes'
import {
  connection,
  type RedisConnectionConfig
} from '@core/yoga/redis/connection'

export interface SnapshotEntry {
  snapshot: JourneySimple
  userId: string
  journeyId: string
  plan: PlanOperation[] | null
}

const EXPIRY_SECONDS = 3600

function buildKey(turnId: string): string {
  return `journeyAiChat:undo:${turnId}`
}

const isUrlConfig = (cfg: RedisConnectionConfig): cfg is { url: string } =>
  'url' in cfg

let redis: Redis | null = null

function getRedis(): Redis {
  if (redis != null) return redis

  redis = isUrlConfig(connection)
    ? new Redis(connection.url)
    : new Redis({ host: connection.host, port: connection.port })

  return redis
}

export async function saveSnapshot(
  turnId: string,
  entry: SnapshotEntry
): Promise<void> {
  await getRedis().set(
    buildKey(turnId),
    JSON.stringify(entry),
    'EX',
    EXPIRY_SECONDS
  )
}

export async function getSnapshot(
  turnId: string
): Promise<SnapshotEntry | null> {
  const raw = await getRedis().get(buildKey(turnId))
  if (raw == null) return null
  return JSON.parse(raw) as SnapshotEntry
}

export async function deleteSnapshot(turnId: string): Promise<void> {
  await getRedis().del(buildKey(turnId))
}

export async function updateSnapshotPlan(
  turnId: string,
  plan: PlanOperation[] | null
): Promise<void> {
  const client = getRedis()
  const key = buildKey(turnId)

  const raw = await client.get(key)
  if (raw == null) return

  const entry = JSON.parse(raw) as SnapshotEntry
  entry.plan = plan

  const ttl = await client.ttl(key)
  if (ttl <= 0) return

  await client.set(key, JSON.stringify(entry), 'EX', ttl)
}
