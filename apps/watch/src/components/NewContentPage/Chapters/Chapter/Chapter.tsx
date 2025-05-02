import { ReactElement } from 'react'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

import { ChapterMetadata } from './ChapterMetadata'
import { ChapterQuestions } from './ChapterQuestions'
import { ChapterQuotes } from './ChapterQuotes'

interface ChapterProps {
  video: VideoChildFields
}

export function Chapter({ video }: ChapterProps): ReactElement {
  return (
    <div className="py-16 relative scroll-snap-start-always">
      <div data-testid="ChapterVideoPlayer"></div>
      <div className="xl:flex w-full z-1 relative" data-testid="ChapterContent">
        <ChapterMetadata video={video} />
      </div>
    </div>
  )
}
