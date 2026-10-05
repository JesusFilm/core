import { builder } from '../builder'

export const CampaignRegionCountryRef = builder.prismaObject(
  'CampaignRegionCountry',
  {
    description:
      "One country chip on a Campaign Region's card, referenced by its api-languages Country id so flag and translated name come from the owner. Presentation, not identity.",
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      regionId: t.exposeID('regionId', { nullable: false }),
      countryId: t.exposeID('countryId', {
        nullable: false,
        description: 'api-languages Country id.'
      }),
      order: t.exposeInt('order', { nullable: false })
    })
  }
)
