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
      nullable: true,
      resolve: (block) => block.autoplay ?? false
    }),
    startAt: t.exposeInt('startAt', {
      nullable: true
    }),
    endAt: t.exposeInt('endAt', {
      nullable: true
    }),
    muted: t.boolean({
      nullable: true,
      resolve: (block) => block.muted ?? false
    }),
    videoId: t.exposeID('videoId', {
      nullable: true
    }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true
    }),
    source: t.field({
      type: VideoBlockSource,
      nullable: false,
      description: `internal source: videoId, videoVariantLanguageId, and video present
youTube source: videoId, title, description, and duration present`,
      resolve: (block) => block.source ?? 'internal'
    }),
    title: t.exposeString('title', {
      nullable: true
    }),
    description: t.exposeString('description', {
      nullable: true
    }),
    image: t.exposeString('image', {
      nullable: true
    }),
    duration: t.exposeInt('duration', {
      nullable: true
    }),
    objectFit: t.expose('objectFit', {
      type: VideoBlockObjectFit,
      nullable: true
    }),
    posterBlockId: t.exposeID('posterBlockId', {
      nullable: true
    }),
    fullsize: t.boolean({
      nullable: true,
      resolve: (block) => block.fullsize ?? false
    }),
    action: t.relation('action'),
    mediaVideo: t.field({
      type: MediaVideo,
      nullable: true,
      select: {
        source: true,
        videoId: true,
        videoVariantLanguageId: true
      },
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

builder.asEntity(VideoBlock, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (ref) => {
    return await prisma.block.findUnique({ where: { id: ref.id } })
  }
})
