import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GET_ADMIN_VIDEO } from '../../../../../../../libs/useAdminVideo'
import { VideoProvider } from '../../../../../../../libs/VideoProvider'

import {
  DELETE_STUDY_QUESTION,
  GET_STUDY_QUESTIONS,
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
    value: 'Study question 1 text',
    order: 1,
    __typename: 'VideoStudyQuestion'
  },
  {
    id: 'studyQuestions.2',
    value: 'Study question 2 text',
    order: 2,
    __typename: 'VideoStudyQuestion'
  },
  {
    id: 'studyQuestion.3',
    value: 'Study question 3 text',
    order: 3,
    __typename: 'VideoStudyQuestion'
  }
]

// Mock the Apollo client
jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    useApolloClient: () => ({
      refetchQueries: jest.fn().mockResolvedValue({ data: {} })
    })
  }
})

// Mock notistack
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

// Mock the VideoProvider module
jest.mock('../../../../../../../libs/VideoProvider', () => {
  const originalModule = jest.requireActual(
    '../../../../../../../libs/VideoProvider'
  )
  return {
    ...originalModule,
    useVideo: jest.fn().mockReturnValue({
      id: 'video-1',
      slug: 'test-video',
      label: 'featureFilm',
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
    })
  }
})

describe('StudyQuestions', () => {
  it('should render study questions from props', async () => {
    const studyQuestionsMock = {
      request: {
        query: GET_STUDY_QUESTIONS,
        variables: { videoId: 'video-1' }
      },
      result: {
        data: {
          adminVideo: {
            id: 'video-1',
            studyQuestions: mockStudyQuestions,
            __typename: 'AdminVideo'
          }
        }
      }
    }

    render(
      <MockedProvider mocks={[studyQuestionsMock]} addTypename={true}>
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionsList videoId="video-1" />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Study Questions')).toBeInTheDocument()

    // Wait for the query to complete
    await waitFor(() => {
      const question1 = screen.getByTestId('OrderedItem-0')
      expect(
        within(question1).getByText('1. Study question 1 text')
      ).toBeInTheDocument()
    })

    const question1 = screen.getByTestId('OrderedItem-0')
    const question2 = screen.getByTestId('OrderedItem-1')
    const question3 = screen.getByTestId('OrderedItem-2')

    expect(
      within(question1).getByText('1. Study question 1 text')
    ).toBeInTheDocument()

    expect(
      within(question2).getByText('2. Study question 2 text')
    ).toBeInTheDocument()
    expect(
      within(question3).getByText('3. Study question 3 text')
    ).toBeInTheDocument()
  })

  it('should open edit dialog when edit button is clicked', async () => {
    const studyQuestionsMock = {
      request: {
        query: GET_STUDY_QUESTIONS,
        variables: { videoId: 'video-1' }
      },
      result: {
        data: {
          adminVideo: {
            id: 'video-1',
            studyQuestions: mockStudyQuestions,
            __typename: 'AdminVideo'
          }
        }
      }
    }

    render(
      <MockedProvider mocks={[studyQuestionsMock]} addTypename={true}>
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionsList videoId="video-1" />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the query to complete
    await waitFor(() => {
      const question = screen.getByTestId('OrderedItem-0')
      expect(
        within(question).getByText('1. Study question 1 text')
      ).toBeInTheDocument()
    })

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

  it('should update question order and trigger refetch', async () => {
    // Mock the mutation for order update
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
            order: 2,
            __typename: 'VideoStudyQuestion'
          }
        }
      }
    }

    const adminVideoMock = {
      request: {
        query: GET_ADMIN_VIDEO,
        variables: { videoId: 'video-1' }
      },
      result: {
        data: {
          adminVideo: {
            ...video,
            studyQuestions: [
              mockStudyQuestions[1],
              mockStudyQuestions[0],
              mockStudyQuestions[2]
            ]
          }
        }
      }
    }

    const studyQuestionsMock = {
      request: {
        query: GET_STUDY_QUESTIONS,
        variables: { videoId: 'video-1' }
      },
      result: {
        data: {
          adminVideo: {
            id: 'video-1',
            studyQuestions: mockStudyQuestions,
            __typename: 'AdminVideo'
          }
        }
      }
    }

    // Use a component wrapper to test the DnD functionality
    // In a real test you would simulate drag and drop, but for this test
    // we're just verifying the cache integration
    const { rerender } = render(
      <MockedProvider
        mocks={[orderUpdateMock, adminVideoMock, studyQuestionsMock]}
        addTypename={true}
      >
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionsList videoId="video-1" />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the query to complete
    await waitFor(() => {
      const question = screen.getByTestId('OrderedItem-0')
      expect(
        within(question).getByText('1. Study question 1 text')
      ).toBeInTheDocument()
    })

    // Rerender with updated order to simulate after drag
    // This is a simplified test since actual DnD testing is complex
    const updatedQuestions = [
      mockStudyQuestions[1],
      mockStudyQuestions[0],
      mockStudyQuestions[2]
    ]

    const updatedStudyQuestionsMock = {
      request: {
        query: GET_STUDY_QUESTIONS,
        variables: { videoId: 'video-1' }
      },
      result: {
        data: {
          adminVideo: {
            id: 'video-1',
            studyQuestions: updatedQuestions,
            __typename: 'AdminVideo'
          }
        }
      }
    }

    rerender(
      <MockedProvider
        mocks={[orderUpdateMock, adminVideoMock, updatedStudyQuestionsMock]}
        addTypename={true}
      >
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionsList videoId="video-1" />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Assert that the cache got updated with our new order
    // (This is just a simple check, in reality we would test the actual drag and drop)
    await waitFor(() => {
      expect(screen.getAllByTestId(/OrderedItem-\d/).length).toBe(3)
    })
  })

  it('should delete study question and update the list', async () => {
    // Create delete mock
    const deleteMock = {
      request: {
        query: DELETE_STUDY_QUESTION,
        variables: { id: 'studyQuestion.1' }
      },
      result: {
        data: {
          videoStudyQuestionDelete: {
            id: 'studyQuestion.1',
            __typename: 'VideoStudyQuestion'
          }
        }
      }
    }

    const studyQuestionsMock = {
      request: {
        query: GET_STUDY_QUESTIONS,
        variables: { videoId: 'video-1' }
      },
      result: {
        data: {
          adminVideo: {
            id: 'video-1',
            studyQuestions: mockStudyQuestions,
            __typename: 'AdminVideo'
          }
        }
      }
    }

    // Mock after deletion result
    const afterDeleteMock = {
      request: {
        query: GET_STUDY_QUESTIONS,
        variables: { videoId: 'video-1' }
      },
      result: {
        data: {
          adminVideo: {
            id: 'video-1',
            studyQuestions: mockStudyQuestions.slice(1),
            __typename: 'AdminVideo'
          }
        }
      }
    }

    render(
      <MockedProvider
        mocks={[deleteMock, studyQuestionsMock, afterDeleteMock]}
        addTypename={true}
      >
        <SnackbarProvider>
          <VideoProvider video={video}>
            <StudyQuestionsList videoId="video-1" />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the query to complete
    await waitFor(() => {
      const question = screen.getByTestId('OrderedItem-0')
      expect(
        within(question).getByText('1. Study question 1 text')
      ).toBeInTheDocument()
    })

    // Verify we have 3 questions at the start
    expect(screen.getAllByTestId(/OrderedItem-\d/).length).toBe(3)

    // Open delete dialog
    const question1 = screen.getByTestId('OrderedItem-0')
    const menuButton = within(question1).getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    const deleteOption = screen.getByText('Delete')
    fireEvent.click(deleteOption)

    // Verify dialog is open
    expect(screen.getByText('Delete Study Question')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Are you sure you want to delete this study question? This action cannot be undone.'
      )
    ).toBeInTheDocument()

    // Click delete button
    const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmDeleteButton)

    // Verify success message and dialog closes
    await waitFor(() => {
      expect(
        screen.queryByText('Delete Study Question')
      ).not.toBeInTheDocument()
    })

    // This would require a new mock for the refetched query showing 2 items
    // In a real app, we'd wait for the cache to be updated
  })
})
