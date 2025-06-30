import { builder } from '../../builder'
import { Block } from '../block'

export const ImageBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'ImageBlock',
  isTypeOf: (obj: any) => obj.typename === 'ImageBlock',
  directives: { key: { fields: 'id' } },
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
    src: t.exposeString('src', {
      nullable: true,
      directives: { shareable: true }
    }),
    alt: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.alt ?? ''
    }),
    width: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.width ?? 0
    }),
    height: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.height ?? 0
    }),
    blurhash: t.string({
      nullable: false,
      directives: { shareable: true },
      description: `blurhash is a compact representation of a placeholder for an image.
Find a frontend implementation at https://github.com/woltapp/blurhash
  `,
      resolve: (block) => block.blurhash ?? ''
    }),
    focalTop: t.exposeInt('focalTop', {
      nullable: true,
      directives: { shareable: true }
    }),
    focalLeft: t.exposeInt('focalLeft', {
      nullable: true,
      directives: { shareable: true }
    }),
    scale: t.exposeInt('scale', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})
