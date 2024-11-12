import { builder } from '../../../builder'
import { Service } from '../../../enums/service'

export const ShortLinkDomainUpdateInput = builder.inputType(
  'ShortLinkDomainUpdateInput',
  {
    fields: (t) => ({
      services: t.field({ type: [Service], required: true })
    })
  }
)
