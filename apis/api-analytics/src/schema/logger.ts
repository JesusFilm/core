import { logger as parentLogger } from '../logger'

export const logger = parentLogger.child({ module: 'graphql' })
