import { builder } from '../../builder'

export const CampaignUpdateInput = builder.inputType('CampaignUpdateInput', {
  description:
    'Campaign settings. Both fields are optional: an omitted field leaves the stored value alone. Neither is a Command in the editor.',
  fields: (t) => ({
    title: t.string({
      required: false,
      description:
        'Default-language title, required when given, at most 100 characters. Changing it never regenerates the slug.'
    }),
    slug: t.string({
      required: false,
      description:
        'Author-edited Campaign Address slug: lowercase letters, digits and single hyphens, at most 200 characters, not a reserved word, globally unique.'
    })
  })
})
