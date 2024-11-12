import { builder } from '../../../builder'
import { Service } from '../../../enums/service'

export const ShortLinkDomainCreateInput = builder.inputType(
  'ShortLinkDomainCreateInput',
  {
    fields: (t) => ({
      hostname: t.string({ required: true }),
      services: t.field({ type: [Service], required: false })
    })
  }
)
