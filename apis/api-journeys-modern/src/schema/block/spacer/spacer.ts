import { builder } from '../../builder'
import { Block } from '../block'

export const SpacerBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'SpacerBlock',
  isTypeOf: (obj: any) => obj.typename === 'SpacerBlock',
  shareable: true,
  fields: (t) => ({
    spacing: t.exposeInt('spacing', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})
