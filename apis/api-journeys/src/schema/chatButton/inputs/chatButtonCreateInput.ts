import { builder } from '../../builder'
import { MessagePlatform } from '../../enums'

export const ChatButtonCreateInput = builder.inputType(
  'ChatButtonCreateInput',
  {
    fields: (t) => ({
      link: t.string(),
      platform: t.field({ type: MessagePlatform })
    })
  }
)
