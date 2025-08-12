import { builder } from '../../builder'
import { Block } from '../block'

export const RadioOptionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioOptionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioOptionBlock',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', {
      nullable: false,
      directives: { shareable: true }
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    label: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.label ?? ''
    }),
    pollOptionImageBlockId: t.exposeID('pollOptionImageBlockId', {
      nullable: true,
      directives: { shareable: true },
      description: `pollOptionImageBlockId is present if a child block should be used as a poll option image.
      This child block should not be rendered normally, instead it should be used
      as a poll option image. Blocks are often of type ImageBlock`
    })
  })
})
