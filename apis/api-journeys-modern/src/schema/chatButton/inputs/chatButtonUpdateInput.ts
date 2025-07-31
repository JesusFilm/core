import { builder } from '../../builder'
import { MessagePlatform } from '../../enums'

export const ChatButtonUpdateInput = builder.inputType(
  'ChatButtonUpdateInput',
  {
    fields: (t) => ({
      link: t.string({ required: true }),
      platform: t.field({ type: MessagePlatform, required: true })
    })
  }
)
