import { builder } from '../../builder'
import { VideoLabel } from '../enums/videoLabel'

export const VideosFilter = builder.inputType('VideosFilter', {
  fields: (t) => ({
    availableVariantLanguageIds: t.idList(),
    title: t.string(),
    labels: t.field({ type: [VideoLabel] }),
    ids: t.idList(),
    subtitleLanguageIds: t.idList(),
    published: t.boolean(),
    locked: t.boolean()
  })
})
