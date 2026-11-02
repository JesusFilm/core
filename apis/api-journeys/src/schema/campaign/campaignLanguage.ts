import { builder } from '../builder'
import { Language } from '../language'

export const CampaignLanguageRef = builder.prismaObject('CampaignLanguage', {
  description:
    'One Page Language of a Campaign. The campaign default is always among them; removing the default or the last language is refused.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    campaignId: t.exposeID('campaignId', { nullable: false }),
    languageId: t.exposeID('languageId', {
      nullable: false,
      description: 'api-languages Language id.'
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: (campaignLanguage) => ({ id: campaignLanguage.languageId })
    }),
    order: t.exposeInt('order', { nullable: false })
  })
})
