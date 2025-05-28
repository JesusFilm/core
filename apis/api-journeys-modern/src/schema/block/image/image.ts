import { builder } from '../../builder'
import { Block } from '../block'

builder.prismaObject('Block', {
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
    alt: t.exposeString('alt', {
      nullable: true,
      directives: { shareable: true }
    }),
    width: t.exposeInt('width', {
      nullable: true,
      directives: { shareable: true }
    }),
    height: t.exposeInt('height', {
      nullable: true,
      directives: { shareable: true }
    }),
    blurhash: t.exposeString('blurhash', {
      nullable: true,
      directives: { shareable: true }
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
