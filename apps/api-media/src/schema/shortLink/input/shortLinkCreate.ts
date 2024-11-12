import { builder } from '../../builder'
import { Service } from '../../enums/service'

export const ShortLinkCreateInput = builder.inputType('ShortLinkCreateInput', {
  fields: (t) => ({
    pathname: t.string({ required: true }),
    to: t.string({ required: true }),
    hostname: t.string({ required: true }),
    service: t.field({ type: Service, required: true })
  })
})
