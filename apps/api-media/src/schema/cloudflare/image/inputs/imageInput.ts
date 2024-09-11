import { builder } from '../../../builder'
import { ImageAspectRatio } from '../enums'

export const ImageInput = builder.inputType('ImageInput', {
  fields: (t) => ({
    aspectRatio: t.field({ type: ImageAspectRatio }),
    videoId: t.id()
  })
})
