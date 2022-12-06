import { fireEvent, render } from '@testing-library/react'
import { videos } from '../../Videos/testData'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoContent } from './VideoContent'

const video: VideoContentFields = videos[0]

describe('VideoContent', () => {
  it('should switch tabs', () => {
    const { getByRole, getByText } = render(<VideoContent video={video} />)
    fireEvent.click(getByRole('tab', { name: 'Discussion Questions' }))
    expect(getByText(video.studyQuestions[0].value)).toBeInTheDocument()
  })
  it('should hide the dicussion questions tab if no questions', () => {
    const { queryByRole } = render(
      <VideoContent video={{ ...video, studyQuestions: [] }} />
    )
    expect(
      queryByRole('tab', {
        name: 'Discussion Questions'
      })
    ).not.toBeInTheDocument()
  })
})
