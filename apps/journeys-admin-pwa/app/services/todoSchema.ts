export const itemSchema = {
  version: 0,
  title: 'todo',
  description: 'A simple todo schema',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    done: {
      type: 'boolean'
    }
  }
}
