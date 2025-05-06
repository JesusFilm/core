import { ReactElement } from 'react'

import {
  VideoChildFields,
  VideoChildFields_studyQuestions
} from '../../../../../__generated__/VideoChildFields'

import { ChapterQuestions } from './ChapterQuestions'

interface ChapterProps {
  video: VideoChildFields
}

export function Chapter({ video }: ChapterProps): ReactElement {
  const questions =
    video?.studyQuestions.length > 0
      ? video.studyQuestions
      : ([
          {
            id: 0,
            value:
              'If you could ask the creator of this video a question, what would it be?'
          }
        ] as unknown as VideoChildFields_studyQuestions[])

  return (
    <div className="py-16 relative scroll-snap-start-always" id={video.slug}>
      <div data-testid="ChapterVideoPlayer"></div>
<<<<<<< HEAD
      <div
        className="xl:flex w-full z-1 relative"
        data-testid="ChapterContent"
      ></div>
=======
      <div className="xl:flex w-full z-1 relative" data-testid="ChapterContent">
        <ChapterMetadata video={video} />
        <ChapterQuestions questions={questions} />
      </div>
>>>>>>> 69278c0d2 (feat: discussion question components)
    </div>
  )
}
