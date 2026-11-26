import { builder } from '../../builder'
import { Platform } from '../enums/platform'
import { VideoLabel } from '../enums/videoLabel'

export const VideoUpdateInput = builder.inputType('VideoUpdateInput', {
  fields: (t) => ({
    id: t.string({ required: true }),
    label: t.field({
      type: VideoLabel,
      required: false
    }),
    primaryLanguageId: t.string({ required: false }),
    published: t.boolean({ required: false }),
    slug: t.string({ required: false }),
    noIndex: t.boolean({ required: false }),
    childIds: t.field({ type: ['String'], required: false }),
    keywordIds: t.stringList({ required: false }),
    restrictDownloadPlatforms: t.field({ type: [Platform], required: false }),
    restrictViewPlatforms: t.field({ type: [Platform], required: false }),
    restrictTranslations: t.boolean({ required: false }),
    gospelPresentation: t.boolean({ required: false }),
    gospelStartSeconds: t.int({ required: false }),
    gospelEndSeconds: t.int({ required: false }),
    opportunityToRespond: t.boolean({ required: false }),
    opportunityToRespondEndSeconds: t.int({ required: false }),
    biblicallyAccuratePortrayal: t.boolean({ required: false }),
    personOfJesusDisplayed: t.boolean({ required: false }),
    validationComments: t.string({ required: false })
  })
})
