import { fireEvent, render, screen, within } from '@testing-library/react'

import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoContent } from './VideoContent'

const video: VideoContentFields = videos[0]

describe('VideoContent', () => {
  it('should show sharing ideas wall when tab selected', () => {
    render(
      <VideoProvider value={{ content: video }}>
        <VideoContent />
      </VideoProvider>
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Sharing Ideas' }))

    const ideasWall = screen.getByTestId('SharingIdeasWall')

    expect(ideasWall).toBeInTheDocument()
    expect(
      within(ideasWall).getByText(video.studyQuestions[0].value)
    ).toBeInTheDocument()
  })

  it('should hide the discussion questions tab if no questions', () => {
    const { queryByRole, getByRole } = render(
      <VideoProvider value={{ content: { ...video, studyQuestions: [] } }}>
        <VideoContent />
      </VideoProvider>
    )
    expect(
      queryByRole('tab', {
        name: 'Discussion Questions'
      })
    ).not.toBeInTheDocument()
    expect(getByRole('tab', { name: 'Sharing Ideas' })).toBeInTheDocument()
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

    const { getByRole } = render(
      <VideoProvider value={{ content: { ...video, studyQuestions } }}>
        <VideoContent />
      </VideoProvider>
    )

    fireEvent.click(
      getByRole('tab', { name: 'Discussion Discussion Questions' })
    )

    const discussionPanel = screen.getByRole('tabpanel', {
      name: 'Discussion Discussion Questions'
    })

    // Should show non-primary questions
    expect(
      within(discussionPanel).getByText('Non-Primary Question 1')
    ).toBeInTheDocument()
    expect(
      within(discussionPanel).getByText('Non-Primary Question 2')
    ).toBeInTheDocument()

    // Should not show primary questions
    expect(
      within(discussionPanel).queryByText('Primary Question 1')
    ).not.toBeInTheDocument()
    expect(
      within(discussionPanel).queryByText('Primary Question 2')
    ).not.toBeInTheDocument()
  })
})
