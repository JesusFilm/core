import { fireEvent, render } from '@testing-library/react'
import { videos } from '../../Videos/testData'
import { VideoProvider } from '../../../libs/videoContext'
import { VideoFields } from '../../../libs/videoContext/VideoContext'
import { VideoContent } from './VideoContent'

const video: VideoFields = videos[0]

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
