import { builder } from '../../builder'
import { VideoBlockObjectFit } from '../../mediaVideo/enums/videoObjectFit'
import { VideoBlockSource } from '../../mediaVideo/enums/videoSource'
import { Block } from '../block'

builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'VideoBlock',
  isTypeOf: (obj: any) => obj.typename === 'VideoBlock',
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
    startAt: t.exposeInt('startAt', {
      nullable: true,
      directives: { shareable: true }
    }),
    endAt: t.exposeInt('endAt', {
      nullable: true,
      directives: { shareable: true }
    }),
    muted: t.exposeBoolean('muted', {
      nullable: true,
      directives: { shareable: true }
    }),
    autoplay: t.exposeBoolean('autoplay', {
      nullable: true,
      directives: { shareable: true }
    }),
    posterBlockId: t.exposeID('posterBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    fullsize: t.exposeBoolean('fullsize', {
      nullable: true,
      directives: { shareable: true }
    }),
    videoId: t.exposeID('videoId', {
      nullable: true,
      directives: { shareable: true }
    }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true,
      directives: { shareable: true }
    }),
    source: t.field({
      type: VideoBlockSource,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.source
    }),
    objectFit: t.field({
      type: VideoBlockObjectFit,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.objectFit
    }),
    title: t.exposeString('title', {
      nullable: true,
      directives: { shareable: true }
    }),
    description: t.exposeString('description', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})
