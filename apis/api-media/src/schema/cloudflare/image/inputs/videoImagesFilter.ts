import { DateTimeFilter, builder } from '../../../builder'
import { ImageAspectRatio } from '../enums/imageAspectRatio'

export const VideoImagesFilter = builder.inputType('VideoImagesFilter', {
  fields: (t) => ({
    updatedAt: t.field({ type: DateTimeFilter, required: false }),
    videoId: t.id({ required: false }),
    aspectRatio: t.field({ type: ImageAspectRatio, required: false })
  })
})
