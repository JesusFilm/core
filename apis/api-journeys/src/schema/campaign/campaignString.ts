import { builder } from '../builder'

import { CampaignStringKey } from './enums'
import { TranslatedValueRef, toTranslatedValues } from './translatedValue'
import { TEXT_CAPS } from './validation'

export const CampaignStringRef = builder.prismaObject('CampaignString', {
  description:
    'One of the fixed interface phrases of a Campaign ("Copy link", "All regions", …): a Translated Field keyed by a fixed name, seeded with every campaign and shown in the Page Language.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    campaignId: t.exposeID('campaignId', { nullable: false }),
    key: t.expose('key', { type: CampaignStringKey, nullable: false }),
    value: t.exposeString('value', {
      nullable: false,
      description: `Default-language wording, at most ${TEXT_CAPS.stringValue} characters.`
    }),
    valueTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (string) => toTranslatedValues(string.valueTranslations)
    })
  })
})
