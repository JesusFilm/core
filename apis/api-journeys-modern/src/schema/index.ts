import { env } from '../env'

import { generate } from './generate'

export { schema } from './schema'

if (
  (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') ||
  process.env.GENERATE_SCHEMA === 'true'
) {
  generate()
  if (process.env.GENERATE_SCHEMA === 'true') process.exit(0)
}
