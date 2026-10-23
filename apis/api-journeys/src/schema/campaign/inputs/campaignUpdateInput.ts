import { builder } from '../../builder'
import { SLUG_MAX_LENGTH } from '../slug'
import { TEXT_CAPS } from '../validation'

export const CampaignUpdateInput = builder.inputType('CampaignUpdateInput', {
  description:
    'Campaign settings and the Palette. Every field is optional: an omitted field leaves the stored value alone. None is a Command in the editor.',
  fields: (t) => ({
    title: t.string({
      required: false,
      description: `Default-language title, required when given, at most ${TEXT_CAPS.campaignTitle} characters. Changing it never regenerates the slug.`
    }),
    slug: t.string({
      required: false,
      description: `Author-edited Campaign Address slug: lowercase letters, digits and single hyphens, at most ${SLUG_MAX_LENGTH} characters, not a reserved word, globally unique.`
    }),
    defaultLanguageId: t.id({
      required: false,
      description:
        'api-languages Language id of the new default language, one of the campaign’s languages. Refused with CONFLICT until every text exists in it; when complete, each field’s default text moves to the old default’s translation and the new language’s translation becomes the field.'
    }),
    palette: t.stringList({
      required: false,
      description:
        'The Palette, newest first: each entry a hex colour (stored as `#RRGGBB` uppercase), deduplicated, at most eight kept. Picker chrome, committed on picker blur and never undone.'
    })
  })
})
