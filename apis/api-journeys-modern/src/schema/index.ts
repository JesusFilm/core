import { generate } from './generate.ts'

export { schema } from './schema.ts'

if (
  (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') ||
  process.env.GENERATE_SCHEMA === 'true'
) {
  generate()
  if (process.env.GENERATE_SCHEMA === 'true') process.exit(0)
}
