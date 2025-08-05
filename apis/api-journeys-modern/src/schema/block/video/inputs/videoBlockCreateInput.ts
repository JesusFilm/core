import { builder } from '../../../builder'
import { VideoBlockSource } from '../../../enums'
import { VideoBlockObjectFit } from '../enums/videoObjectFit'

export const VideoBlockCreateInput = builder.inputType(
  'VideoBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      videoId: t.id({ required: false }),
      videoVariantLanguageId: t.id({ required: false }),
      source: t.field({ type: VideoBlockSource, required: false }),
      title: t.string({ required: false }),
      description: t.string({ required: false }),
      image: t.string({ required: false }),
      duration: t.int({ required: false }),
      objectFit: t.field({ type: VideoBlockObjectFit, required: false }),
      startAt: t.int({ required: false }),
      endAt: t.int({ required: false }),
      muted: t.boolean({ required: false }),
      autoplay: t.boolean({ required: false }),
      fullsize: t.boolean({ required: false }),
      posterBlockId: t.id({ required: false })
    })
  }
)
