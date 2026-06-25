import { env } from '../../env'

export const connection = {
  host: env.REDIS_URL,
  port: env.REDIS_PORT
}
