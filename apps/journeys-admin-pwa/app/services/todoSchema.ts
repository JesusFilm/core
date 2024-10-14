export const itemSchema = {
  version: 0,
  title: 'todo',
  description: 'A simple todo schema',
  primaryKey: 'id', // <= the primary key is must
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100 // <- the primary key must have set maxLength
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
