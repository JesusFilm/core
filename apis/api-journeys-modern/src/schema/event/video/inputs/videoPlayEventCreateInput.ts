import { builder } from '../../../builder'
import { VideoBlockSource } from '../../../enums'

export const VideoPlayEventCreateInput = builder.inputType(
  'VideoPlayEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      position: t.float({ required: false }),
      label: t.string({ required: false }),
      value: t.field({ type: VideoBlockSource, required: false })
    })
  }
)
