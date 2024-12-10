//currently just an extended object used in videoblock

import { builder } from '../builder'
import { VideoSource, VideoSourceShape } from '../videoSource/videoSource'

interface YoutubeShape {
  id: string
}

const YouTube = builder.objectRef<YoutubeShape>('Youtube')
YouTube.implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    source: t.field({
      type: VideoSource,
      shareable: true,
      resolve: () => VideoSourceShape.mux
    }),
    primaryLanguageId: t.id({
      nullable: true,
      shareable: true,
      resolve: () => null
    })
  })
})

builder.asEntity(YouTube, {
  key: builder.selection<{ id: string; primaryLanguageId: string }>(
    'id primaryLanguageId'
  ),
  resolveReference: async ({ id }) => ({
    id,
    source: VideoSourceShape.youTube,
    primaryLanguageId: null
  })
})
