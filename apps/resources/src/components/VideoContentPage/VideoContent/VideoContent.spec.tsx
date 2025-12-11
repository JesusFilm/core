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

  it('should hide the discussion questions tab if no questions', () => {
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

  it('should only show non-primary questions when they exist', () => {
    const studyQuestions = [
      {
        __typename: 'VideoStudyQuestion' as const,
        value: 'Primary Question 1',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion' as const,
        value: 'Non-Primary Question 1',
        primary: false
      },
      {
        __typename: 'VideoStudyQuestion' as const,
        value: 'Primary Question 2',
        primary: true
      },
      {
        __typename: 'VideoStudyQuestion' as const,
        value: 'Non-Primary Question 2',
        primary: false
      }
    ]

    const { getByRole, getByText, queryByText } = render(
      <VideoProvider value={{ content: { ...video, studyQuestions } }}>
        <VideoContent />
      </VideoProvider>
    )

    fireEvent.click(
      getByRole('tab', { name: 'Discussion Discussion Questions' })
    )

    // Should show non-primary questions
    expect(getByText('Non-Primary Question 1')).toBeInTheDocument()
    expect(getByText('Non-Primary Question 2')).toBeInTheDocument()

    // Should not show primary questions
    expect(queryByText('Primary Question 1')).not.toBeInTheDocument()
    expect(queryByText('Primary Question 2')).not.toBeInTheDocument()
  })
})
