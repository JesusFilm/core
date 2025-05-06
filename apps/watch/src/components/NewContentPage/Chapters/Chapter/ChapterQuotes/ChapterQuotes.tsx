import { ReactElement } from 'react'

import { VideoChildFields } from '../../../../../../__generated__/VideoChildFields'

interface ChapterQuotesProps {
  video: VideoChildFields
}

export function ChapterQuotes({ video }: ChapterQuotesProps): ReactElement {
  return (
    <div data-testid="ChapterQuotes">
      <h1>Bible quotes</h1>
    </div>
  )
}
