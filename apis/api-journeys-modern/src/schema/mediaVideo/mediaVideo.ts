import { VideoBlockSource as PrismaVideoBlockSource } from '.prisma/api-journeys-modern-client'

import { builder } from '../builder'

import { VideoBlockObjectFit } from './enums/videoObjectFit'
import { VideoBlockSource } from './enums/videoSource'

const MuxVideo = builder.externalRef(
  'MuxVideo',
  builder.selection<{
    id: string
    primaryLanguageId: string | null
  }>('id primaryLanguageId'),
  (data) => ({
    ...data,
    source: PrismaVideoBlockSource.mux
  })
)

MuxVideo.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false }),
    primaryLanguageId: t.id()
  }),
  fields: (t) => ({
    source: t.expose('source', {
      type: VideoBlockSource,
      nullable: false,
      shareable: true
    })
  })
})

const YouTube = builder.externalRef(
  'YouTube',
  builder.selection<{
    id: string
    primaryLanguageId: string | null
  }>('id primaryLanguageId'),
  (data) => ({
    ...data,
    source: PrismaVideoBlockSource.youTube
  })
)

YouTube.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false }),
    primaryLanguageId: t.id()
  }),
  fields: (t) => ({
    source: t.expose('source', {
      type: VideoBlockSource,
      nullable: false,
      shareable: true
    })
  })
})

const Video = builder.externalRef(
  'Video',
  builder.selection<{
    id: string
    primaryLanguageId: string | null
  }>('id primaryLanguageId'),
  (data) => ({
    ...data,
    source: PrismaVideoBlockSource.internal
  })
)

Video.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false }),
    primaryLanguageId: t.id({ nullable: false })
  }),
  fields: (t) => ({
    source: t.expose('source', {
      type: VideoBlockSource,
      nullable: false,
      shareable: true
    })
  })
})

const MediaVideo = builder.unionType('MediaVideo', {
  types: [MuxVideo, Video, YouTube],
  resolveType: (video) => {
    switch (video.source) {
      case PrismaVideoBlockSource.mux:
        return MuxVideo
      case PrismaVideoBlockSource.internal:
        return Video
      case PrismaVideoBlockSource.youTube:
        return YouTube
      default:
        return null
    }
  }
})

// Rename VideoBlock to VideoBlockMedia to avoid duplicate type definition
const VideoBlockMedia = builder.externalRef(
  'VideoBlock',
  builder.selection<{
    id: string
    source: PrismaVideoBlockSource
    videoId: string | null
    videoVariantLanguageId: string | null
  }>('id source videoId videoVariantLanguageId')
)

VideoBlockMedia.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false, directives: { shareable: true } }),
    videoId: t.id({
      nullable: true,
      directives: { shareable: true }
    }),
    source: t.field({
      type: VideoBlockSource,
      nullable: false,
      directives: { shareable: true }
    }),
    videoVariantLanguageId: t.id({ directives: { shareable: true } })
  }),
  fields: (t) => ({
    journeyId: t.id({
      nullable: false,
      directives: { shareable: true },
      resolve: () => '' // Note: this is a placeholder that should be replaced with actual data
    }),
    parentBlockId: t.id({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    parentOrder: t.int({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    typename: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: () => 'VideoBlock'
    }),
    mediaVideo: t.field({
      type: MediaVideo,
      resolve: (video) =>
        video.videoId != null && video.source !== 'cloudflare'
          ? {
              id: video.videoId,
              source: video.source,
              primaryLanguageId: video.videoVariantLanguageId
            }
          : null
    }),
    // Add the shareable fields from the Video Block type
    startAt: t.int({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    endAt: t.int({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    muted: t.boolean({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    autoplay: t.boolean({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    posterBlockId: t.id({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    fullsize: t.boolean({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    objectFit: t.field({
      type: VideoBlockObjectFit,
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    title: t.string({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    }),
    description: t.string({
      nullable: true,
      directives: { shareable: true },
      resolve: () => null
    })
  }),
  directives: { key: { fields: 'id' } }
})
