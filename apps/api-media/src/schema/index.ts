import { generate } from './generate'

export { schema } from './schema'

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test')
  generate()
