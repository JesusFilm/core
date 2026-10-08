import { builder } from '../builder'
import { Country } from '../country'

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
      country: t.field({
        type: Country,
        nullable: false,
        description:
          'The api-languages Country, resolved through federation: flag and translated name live there.',
        resolve: (regionCountry) => ({ id: regionCountry.countryId })
      }),
      order: t.exposeInt('order', { nullable: false })
    })
  }
)
