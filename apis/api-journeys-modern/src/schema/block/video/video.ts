import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { VideoBlockSource } from '../../enums'
import { MediaVideo } from '../../mediaVideo/mediaVideo'
import { Block } from '../block'

import { VideoBlockObjectFit } from './enums/videoObjectFit'

function isMediaVideoSource(
  source: string
): source is 'internal' | 'mux' | 'youTube' {
  return source === 'internal' || source === 'mux' || source === 'youTube'
}

export const VideoBlock = builder.prismaObject('Block', {
  shareable: true,
  interfaces: [Block],
  variant: 'VideoBlock',
  isTypeOf: (obj: any) => obj.typename === 'VideoBlock',
  fields: (t) => ({
    autoplay: t.boolean({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.autoplay ?? false
    }),
    startAt: t.exposeInt('startAt', {
      nullable: true,
      directives: { shareable: true }
    }),
    endAt: t.exposeInt('endAt', {
      nullable: true,
      directives: { shareable: true }
    }),
    muted: t.boolean({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.muted ?? false
    }),
    videoId: t.exposeID('videoId', {
      nullable: true,
      directives: { shareable: true }
    }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true,
      directives: { shareable: true }
    }),
    source: t.expose('source', {
      type: VideoBlockSource,
      nullable: true,
      directives: { shareable: true }
    }),
    title: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.title ?? ''
    }),
    description: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.description ?? ''
    }),
    image: t.exposeString('image', {
      nullable: true,
      directives: { shareable: true }
    }),
    duration: t.exposeInt('duration', {
      nullable: true,
      directives: { shareable: true }
    }),
    objectFit: t.expose('objectFit', {
      type: VideoBlockObjectFit,
      nullable: true,
      directives: { shareable: true }
    }),
    posterBlockId: t.exposeID('posterBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    fullsize: t.boolean({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.fullsize ?? false
    }),
    action: t.relation('action'),
    mediaVideo: t.field({
      type: MediaVideo,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => {
        if (
          !block.source ||
          !isMediaVideoSource(block.source) ||
          !block.videoId
        ) {
          return null
        }

        // Return a reference to the external video entity with correct typing
        return {
          id: block.videoId,
          primaryLanguageId: block.videoVariantLanguageId,
          source: block.source
        } as any
      }
    })
  })
})
