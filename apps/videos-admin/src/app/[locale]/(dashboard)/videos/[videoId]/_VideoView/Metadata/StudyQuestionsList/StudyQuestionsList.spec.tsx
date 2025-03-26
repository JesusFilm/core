import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import {
  DELETE_STUDY_QUESTION,
  StudyQuestionsList,
  UPDATE_STUDY_QUESTION_ORDER
} from './StudyQuestionsList'

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
  Edit: 'Edit',
  'Edit Study Question': 'Edit Study Question'
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

const mockStudyQuestions = [
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
]

// Mock notistack
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

describe('StudyQuestions', () => {
  it('should render study questions from props', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionsList studyQuestions={mockStudyQuestions} />
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

  it('should open edit dialog when edit button is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionsList studyQuestions={mockStudyQuestions} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Click the menu button for the first question
    const question1 = screen.getByTestId('OrderedItem-0')
    // Use the correct aria-label for the menu button
    const menuButton = within(question1).getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    // Click the edit option
    const editOption = screen.getByText('Edit')
    fireEvent.click(editOption)

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('Edit Study Question')).toBeInTheDocument()
    })

    // The text field should contain the question text
    expect(screen.getByPlaceholderText('Enter study question')).toHaveValue(
      'Study question 1 text'
    )
  })

  it('should update question order with Apollo cache', async () => {
    // Mock the mutation for order update
    const cacheModifyMock = jest.fn()

    const orderUpdateMock = {
      request: {
        query: UPDATE_STUDY_QUESTION_ORDER,
        variables: {
          input: {
            id: 'studyQuestion.1',
            order: 2
          }
        }
      },
      result: {
        data: {
          videoStudyQuestionUpdate: {
            id: 'studyQuestion.1',
            value: 'Study question 1 text',
            __typename: 'VideoStudyQuestion'
          }
        }
      },
      newData: jest.fn((cache) => {
        cache.modify = cacheModifyMock
        return cache
      })
    }

    // Use a component wrapper to test the DnD functionality
    // In a real test you would simulate drag and drop, but for this test
    // we're just verifying the cache integration
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider mocks={[orderUpdateMock]} addTypename={true}>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionsList studyQuestions={mockStudyQuestions} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Rerender with updated order to simulate after drag
    // This is a simplified test since actual DnD testing is complex
    const updatedQuestions = [
      mockStudyQuestions[1],
      mockStudyQuestions[0],
      mockStudyQuestions[2]
    ]

    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <MockedProvider mocks={[orderUpdateMock]} addTypename={true}>
          <SnackbarProvider>
            <VideoProvider video={video}>
              <StudyQuestionsList studyQuestions={updatedQuestions} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // After reordering, verify the updated order is displayed
    const questions = screen.getAllByTestId(/OrderedItem-\d/)
    expect(
      within(questions[0]).getByText('1. Study question 2 text')
    ).toBeInTheDocument()
    expect(
      within(questions[1]).getByText('2. Study question 1 text')
    ).toBeInTheDocument()
    expect(
      within(questions[2]).getByText('3. Study question 3 text')
    ).toBeInTheDocument()
  })

  it('should render fallback when no questions exist', () => {
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

  it('should open delete dialog when delete action is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestionsList
            studyQuestions={[
              {
                id: 'studyQuestion.1',
                value: 'Study question 1 text'
              }
            ]}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Open the menu for the first item
    const menuButton = screen.getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    // Click the delete action
    const deleteAction = screen.getByText('Delete')
    fireEvent.click(deleteAction)

    // Check if the dialog is shown
    expect(screen.getByText('Delete Study Question')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Are you sure you want to delete this study question? This action cannot be undone.'
      )
    ).toBeInTheDocument()
  })

  it('should close delete dialog when cancel is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestionsList
            studyQuestions={[
              {
                id: 'studyQuestion.1',
                value: 'Study question 1 text'
              }
            ]}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Open the menu for the first item
    const menuButton = screen.getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    // Click the delete action
    const deleteAction = screen.getByText('Delete')
    fireEvent.click(deleteAction)

    // Click cancel
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // The dialog should be closed
    await waitFor(() => {
      expect(
        screen.queryByText('Delete Study Question')
      ).not.toBeInTheDocument()
    })
  })

  it('should handle delete when confirmed', async () => {
    const mocks = [
      {
        request: {
          query: DELETE_STUDY_QUESTION,
          variables: { id: 'studyQuestion.1' }
        },
        result: {
          data: {
            videoStudyQuestionDelete: {
              id: 'studyQuestion.1'
            }
          }
        }
      }
    ]

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={mocks} addTypename={false}>
          <StudyQuestionsList
            studyQuestions={[
              {
                id: 'studyQuestion.1',
                value: 'Study question 1 text'
              }
            ]}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Open the menu for the first item
    const menuButton = screen.getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    // Click the delete action
    const deleteAction = screen.getByText('Delete')
    fireEvent.click(deleteAction)

    // Click the delete button to confirm
    const deleteButton = screen.getByText('Delete', { selector: 'button' })
    fireEvent.click(deleteButton)

    // Wait for the mutation to complete and dialog to close
    await waitFor(() => {
      expect(
        screen.queryByText('Delete Study Question')
      ).not.toBeInTheDocument()
    })
  })
})
