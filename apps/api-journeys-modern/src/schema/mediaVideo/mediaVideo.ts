import { VideoBlockSource as PrismaVideoBlockSource } from '.prisma/api-journeys-modern-client'

import { builder } from '../builder'

import { VideoBlockSource } from './enums/videoSource'

const CloudflareVideo = builder.externalRef(
  'CloudflareVideo',
  builder.selection<{
    id: string
    primaryLanguageId: string | null
  }>('id primaryLanguageId'),
  (data) => ({
    ...data,
    source: PrismaVideoBlockSource.cloudflare
  })
)

CloudflareVideo.implement({
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
  types: [CloudflareVideo, MuxVideo, Video, YouTube],
  resolveType: (video) => {
    switch (video.source) {
      case PrismaVideoBlockSource.cloudflare:
        return CloudflareVideo
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

const VideoBlock = builder.externalRef(
  'VideoBlock',
  builder.selection<{
    id: string
    source: PrismaVideoBlockSource
    videoId: string
    videoVariantLanguageId: string | null
  }>('id source videoId videoVariantLanguageId')
)

VideoBlock.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false }),
    videoId: t.id({
      nullable: false
    }),
    source: t.field({
      type: VideoBlockSource,
      nullable: false
    }),
    videoVariantLanguageId: t.id()
  }),
  fields: (t) => ({
    mediaVideo: t.field({
      type: MediaVideo,
      resolve: (video) => ({
        id: video.videoId,
        source: video.source,
        primaryLanguageId: video.videoVariantLanguageId
      })
    })
  })
})
