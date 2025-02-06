import { builder } from '../builder'

import { listSupportedLanguages } from './service'

builder.queryField('heygenLanguages', (t) =>
  t.field({
    type: ['String'],
    resolve: async () => {
      return await listSupportedLanguages()
    }
  })
)
