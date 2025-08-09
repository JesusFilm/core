export type RedisConnectionConfig =
  | { url: string }
  | { host: string; port: number }

const envUrl = process.env.REDIS_URL
const envPort = process.env.REDIS_PORT

const isFullUrl = envUrl != null && envUrl.includes('://')

export const connection: RedisConnectionConfig =
  isFullUrl && envUrl != null
    ? { url: envUrl }
    : {
        host: envUrl ?? 'redis',
        port: envPort != null ? Number(envPort) : 6379
      }
