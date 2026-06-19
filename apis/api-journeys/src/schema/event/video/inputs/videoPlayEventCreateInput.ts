import { builder } from '../../../builder'
import { VideoBlockSource } from '../../../enums'

export const VideoPlayEventCreateInput = builder.inputType(
  'VideoPlayEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSource, required: false })
    })
  }
)
