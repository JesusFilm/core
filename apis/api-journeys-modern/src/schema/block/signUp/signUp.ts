import { builder } from '../../builder'
import { BlockEventLabel } from '../../enums'
import { Block } from '../block'

export const SignUpBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'SignUpBlock',
  isTypeOf: (obj: any) => obj.typename === 'SignUpBlock',
  shareable: true,
  fields: (t) => ({
    eventLabel: t.expose('eventLabel', {
      type: BlockEventLabel,
      nullable: true
    }),
    submitIconId: t.exposeID('submitIconId', {
      nullable: true
    }),
    submitLabel: t.exposeString('submitLabel', {
      nullable: true
    }),
    action: t.relation('action', {
      nullable: true
    })
  })
})
