import { builder } from '../../builder'
import { Block } from '../block'

export const RadioOptionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioOptionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioOptionBlock',
  shareable: true,
  fields: (t) => ({
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
