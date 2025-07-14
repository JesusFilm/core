import { builder } from '../../builder'
import { Platform } from '../enums/platform'
import { VideoLabel } from '../enums/videoLabel'
import { VideoMetadataInput } from '../videoMetadata'

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
    metadata: t.field({ type: VideoMetadataInput, required: false })
  })
})
