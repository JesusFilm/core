import { builder } from '../../../builder'

export const CampaignRegionUpdateInput = builder.inputType(
  'CampaignRegionUpdateInput',
  {
    fields: (t) => ({
      name: t.string({
        required: false,
        description:
          'Default-language name. Required, at most 60 characters. Does not move the slug.'
      }),
      slug: t.string({
        required: false,
        description:
          'The region’s address segment. Changing it breaks links to this page you have already shared.'
      }),
      listed: t.boolean({
        required: false,
        description:
          'Whether the region appears on the Region Switcher; false keeps an Orphan Page.'
      })
    })
  }
)
