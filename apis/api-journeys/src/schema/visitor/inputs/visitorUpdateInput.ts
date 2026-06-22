import { builder } from '../../builder'
import { MessagePlatform } from '../../enums'
import { VisitorStatus } from '../enums/visitorStatus'

export const VisitorUpdateInput = builder.inputType('VisitorUpdateInput', {
  fields: (t) => ({
    email: t.string({ required: false }),
    name: t.string({ required: false }),
    messagePlatform: t.field({ type: MessagePlatform, required: false }),
    messagePlatformId: t.string({ required: false }),
    notes: t.string({ required: false }),
    status: t.field({ type: VisitorStatus, required: false }),
    countryCode: t.string({ required: false }),
    referrer: t.string({ required: false }),
    phone: t.string({ required: false })
  })
})
