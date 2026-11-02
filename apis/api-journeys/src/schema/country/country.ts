import { builder } from '../builder'

/**
 * The api-languages Country entity as a federation reference: api-journeys
 * holds only the id (on a Region Country); flag and translated name resolve
 * from the owner through the gateway.
 */
export const Country = builder.externalRef(
  'Country',
  builder.selection<{ id: string }>('id')
)

Country.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: () => ({})
})
