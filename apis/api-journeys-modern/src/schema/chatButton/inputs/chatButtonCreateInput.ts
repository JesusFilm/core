import { builder } from '../../builder'
import { MessagePlatform } from '../../enums'

export const ChatButtonCreateInput = builder.inputType(
  'ChatButtonCreateInput',
  {
    fields: (t) => ({
      link: t.string({ required: true }),
      platform: t.field({ type: MessagePlatform, required: true })
    })
  }
)
