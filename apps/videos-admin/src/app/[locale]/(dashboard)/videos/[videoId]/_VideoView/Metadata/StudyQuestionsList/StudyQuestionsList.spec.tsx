import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import { StudyQuestionsList } from './StudyQuestionsList'

// Define the enum locally for testing purposes
enum VideoLabel {
  collection = 'collection',
  episode = 'episode',
  featureFilm = 'featureFilm',
  segment = 'segment',
  series = 'series',
  shortFilm = 'shortFilm',
  trailer = 'trailer',
  behindTheScenes = 'behindTheScenes'
}

const messages = {
  'Study Questions': 'Study Questions',
  'No study questions': 'No study questions',
  'Study Question': 'Study Question',
  'Enter study question': 'Enter study question',
  'Add Study Question': 'Add Study Question',
  Add: 'Add',
  'Study question is required': 'Study question is required',
  'Failed to create': 'Failed to create',
  'Study question created': 'Study question created',
  Edit: 'Edit'
}

const video = {
  id: 'video-1',
  slug: 'test-video',
  label: VideoLabel.featureFilm,
  published: true,
  title: [{ id: '1', value: 'Test Video' }],
  locked: false,
  images: [],
  imageAlt: [],
  noIndex: false,
  description: [],
  snippet: [],
  children: [],
  variants: [],
  studyQuestions: [],
  variantLanguagesCount: 0,
  subtitles: [],
  videoEditions: []
}

describe('StudyQuestions', () => {
  it('should render', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionsList
                studyQuestions={[
                  {
                    id: 'studyQuestion.1',
                    value: 'Study question 1 text'
                  },
                  {
                    id: 'studyQuestions.2',
                    value: 'Study question 2 text'
                  },
                  {
                    id: 'studyQuestion.3',
                    value: 'Study question 3 text'
                  }
                ]}
              />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Study Questions')).toBeInTheDocument()

    const question1 = screen.getByTestId('OrderedItem-0')
    const question2 = screen.getByTestId('OrderedItem-1')
    const question3 = screen.getByTestId('OrderedItem-2')

    await waitFor(() =>
      expect(
        within(question1).getByText('1. Study question 1 text')
      ).toBeInTheDocument()
    )

    expect(
      within(question2).getByText('2. Study question 2 text')
    ).toBeInTheDocument()
    expect(
      within(question3).getByText('3. Study question 3 text')
    ).toBeInTheDocument()
  })

  it('should render fallback', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionsList studyQuestions={[]} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No study questions')).toBeInTheDocument()
  })
})
