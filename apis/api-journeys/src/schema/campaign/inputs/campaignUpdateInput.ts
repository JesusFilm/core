import { builder } from '../../builder'

export const CampaignUpdateInput = builder.inputType('CampaignUpdateInput', {
  description:
    'Campaign settings. Every field is optional: an omitted field leaves the stored value alone. None is a Command in the editor.',
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
    }),
    defaultLanguageId: t.id({
      required: false,
      description:
        'api-languages Language id of the new default language, one of the campaign’s languages. Refused with CONFLICT until every text exists in it; when complete, each field’s default text moves to the old default’s translation and the new language’s translation becomes the field.'
    })
  })
})
