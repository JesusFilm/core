import { builder } from '../builder'

import { TranslatedValueRef, toTranslatedValues } from './translatedValue'

export const CampaignRegionRef = builder.prismaObject('CampaignRegion', {
  description:
    "A Campaign's regional subdivision, shown on the shared Region Page at its own slug. The translated name is its identity everywhere; the slug is only its address. Unlisted regions keep an Orphan Page.",
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    campaignId: t.exposeID('campaignId', { nullable: false }),
    name: t.exposeString('name', {
      nullable: false,
      description: 'Required, at most 60 characters.'
    }),
    nameTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (region) => toTranslatedValues(region.nameTranslations)
    }),
    slug: t.exposeString('slug', {
      nullable: false,
      description:
        'Unique within the campaign. Changing it breaks links already shared to the region page.'
    }),
    order: t.exposeInt('order', { nullable: false }),
    listed: t.exposeBoolean('listed', {
      nullable: false,
      description: 'Whether the region appears on the Region Switcher.'
    }),
    createdAt: t.expose('createdAt', { type: 'DateTimeISO', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTimeISO', nullable: false }),
    languages: t.relation('languages', {
      nullable: false,
      description: 'Share Languages in selector order.',
      query: { orderBy: { order: 'asc' } }
    }),
    countries: t.relation('countries', {
      nullable: false,
      description: 'Region Countries in chip order.',
      query: { orderBy: { order: 'asc' } }
    })
  })
})
