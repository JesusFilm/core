import { builder } from '../../builder'
import { VideoBlockSource } from '../../mediaVideo/enums/videoSource'
import { MediaVideo } from '../../mediaVideo/mediaVideo'
import { Block } from '../block'

import { VideoBlockObjectFit } from './enums/videoObjectFit'

export const VideoBlock = builder.prismaObject('Block', {
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
      directives: { shareable: true },
      description: `startAt dictates at which point of time the video should start playing`
    }),
    endAt: t.exposeInt('endAt', {
      nullable: true,
      directives: { shareable: true },
      description: `endAt dictates at which point of time the video should end`
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
      directives: { shareable: true },
      description: `posterBlockId is present if a child block should be used as a poster.
This child block should not be rendered normally, instead it should be used
as the video poster. PosterBlock should be of type ImageBlock.`
    }),
    fullsize: t.exposeBoolean('fullsize', {
      nullable: true,
      directives: { shareable: true }
    }),
    videoId: t.exposeID('videoId', {
      nullable: true,
      directives: { shareable: true },
      description: `internal source videos: videoId and videoVariantLanguageId both need to be set
to select a video.
For other sources only videoId needs to be set.`
    }),
    videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
      nullable: true,
      directives: { shareable: true },
      description: `internal source videos: videoId and videoVariantLanguageId both need to be set
to select a video.
For other sources only videoId needs to be set.`
    }),
    source: t.field({
      type: VideoBlockSource,
      nullable: false,
      directives: { shareable: true },
      description: `internal source: videoId, videoVariantLanguageId, and video present
youTube source: videoId, title, description, and duration present`,
      resolve: (block) => block.source ?? 'internal'
    }),
    objectFit: t.field({
      type: VideoBlockObjectFit,
      nullable: true,
      directives: { shareable: true },
      description: `how the video should display within the VideoBlock`,
      resolve: (block) => block.objectFit
    }),
    title: t.exposeString('title', {
      nullable: true,
      directives: { shareable: true },
      description: `internal source videos: this field is not populated and instead only present
in the video field.
For other sources this is automatically populated.`
    }),
    description: t.exposeString('description', {
      nullable: true,
      directives: { shareable: true },
      description: `internal source videos: this field is not populated and instead only present
in the video field.
For other sources this is automatically populated.`
    }),
    mediaVideo: t.field({
      type: MediaVideo,
      resolve: (video) =>
        video.videoId != null &&
        video.source !== 'cloudflare' &&
        video.source !== null
          ? {
              id: video.videoId,
              source: video.source,
              primaryLanguageId: video.videoVariantLanguageId
            }
          : null
    })
  })
})
