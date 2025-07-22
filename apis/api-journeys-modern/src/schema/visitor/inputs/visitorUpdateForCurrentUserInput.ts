import { builder } from '../../builder'
import { MessagePlatform } from '../../enums'
import { VisitorStatus } from '../enums/visitorStatus'

export const VisitorUpdateForCurrentUserInput = builder.inputType(
  'VisitorUpdateForCurrentUserInput',
  {
    fields: (t) => ({
      email: t.string({ required: false }),
      name: t.string({ required: false }),
      messagePlatform: t.field({ type: MessagePlatform, required: false }),
      messagePlatformId: t.string({ required: false }),
      phone: t.string({ required: false })
    })
  }
)
