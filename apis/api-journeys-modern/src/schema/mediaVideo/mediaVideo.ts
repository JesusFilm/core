import { VideoBlockSource as PrismaVideoBlockSource } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { VideoBlockSource } from '../enums'

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

export const MediaVideo = builder.unionType('MediaVideo', {
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
