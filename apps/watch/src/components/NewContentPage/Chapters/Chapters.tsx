import { ReactElement } from 'react'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'

import { Chapter } from './Chapter'

interface ChaptersProps {
  videos: VideoChildFields[]
  containerSlug?: string
}

export function Chapters({
  videos,
  containerSlug
}: ChaptersProps): ReactElement {
  return (
    <div>
      {videos.map((video) => (
        <Chapter key={video.id} video={video} />
      ))}
    </div>
  )
}
