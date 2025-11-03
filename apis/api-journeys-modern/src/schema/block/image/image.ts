import { builder } from '../../builder'
import { Block } from '../block'

export const ImageBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'ImageBlock',
  isTypeOf: (obj: any) => obj.typename === 'ImageBlock',
  shareable: true,
  fields: (t) => ({
    src: t.exposeString('src', {
      nullable: true
    }),
    alt: t.string({
      nullable: false,
      resolve: (block) => block.alt ?? ''
    }),
    width: t.int({
      nullable: false,
      resolve: (block) => block.width ?? 0
    }),
    height: t.int({
      nullable: false,
      resolve: (block) => block.height ?? 0
    }),
    blurhash: t.string({
      nullable: false,
      description: `blurhash is a compact representation of a placeholder for an image.
Find a frontend implementation at https://github.com/woltapp/blurhash
  `,
      resolve: (block) => block.blurhash ?? ''
    }),
    focalTop: t.exposeInt('focalTop', {
      nullable: true
    }),
    focalLeft: t.exposeInt('focalLeft', {
      nullable: true
    }),
    scale: t.exposeInt('scale', {
      nullable: true
    })
  })
})
