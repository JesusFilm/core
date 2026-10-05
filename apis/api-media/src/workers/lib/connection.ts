export const connection = {
  host: process.env.REDIS_URL ?? 'localhost',
  port: process.env.REDIS_PORT != null ? Number(process.env.REDIS_PORT) : 6379
}
