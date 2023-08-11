import { fireEvent, render } from '@testing-library/react'

import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoContent } from './VideoContent'

const video: VideoContentFields = videos[0]

describe('VideoContent', () => {
  it('should switch tabs', () => {
    const { getByRole, getByText } = render(
      <VideoProvider value={{ content: video }}>
        <VideoContent />
      </VideoProvider>
    )
    fireEvent.click(
      getByRole('tab', { name: 'Discussion Discussion Questions' })
    )
    expect(getByText(video.studyQuestions[0].value)).toBeInTheDocument()
  })

  it('should hide the dicussion questions tab if no questions', () => {
    const { queryByRole } = render(
      <VideoProvider value={{ content: { ...video, studyQuestions: [] } }}>
        <VideoContent />
      </VideoProvider>
    )
    expect(
      queryByRole('tab', {
        name: 'Discussion Questions'
      })
    ).not.toBeInTheDocument()
  })
})
