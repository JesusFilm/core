import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  CREATE_EDITION,
  CREATE_VIDEO,
  GET_PARENT_VIDEO_LABEL,
  GET_VIDEO_ORIGINS,
  VideoCreateForm
} from './VideoCreateForm'

// Mock router push function
const mockRouterPush = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockRouterPush
  })),
  usePathname: jest.fn(() => '/videos')
}))

// Mock notistack
jest.mock('notistack', () => ({
  useSnackbar: jest.fn(() => ({
    enqueueSnackbar: jest.fn()
  }))
}))

describe('VideoCreateForm', () => {
  const mockOnCreateSuccess = jest.fn()
  const mockParentId = 'parent-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Mock data for queries and mutations
  const getVideoOriginsMock = {
    request: {
      query: GET_VIDEO_ORIGINS,
      variables: {}
    },
    result: {
      data: {
        videoOrigins: [
          {
            id: 'origin-1',
            name: 'Jesus Film Project',
            description: 'Official Jesus Film Project content',
            __typename: 'VideoOrigin'
          },
          {
            id: 'origin-2',
            name: 'Partner Content',
            description: 'Content from partner organizations',
            __typename: 'VideoOrigin'
          }
        ]
      }
    }
  }

  const createVideoMock = {
    request: {
      query: CREATE_VIDEO,
      variables: {
        input: {
          id: 'test-id',
          slug: 'test-slug',
          label: 'episode',
          originId: 'origin-1',
          primaryLanguageId: '529',
          noIndex: false,
          published: false,
          childIds: []
        }
      }
    },
    result: {
      data: {
        videoCreate: {
          id: 'test-id'
        }
      }
    }
  }

  const createEditionMock = {
    request: {
      query: CREATE_EDITION,
      variables: {
        input: {
          videoId: 'test-id',
          name: 'base'
        }
      }
    },
    result: {
      data: {
        videoEditionCreate: {
          id: 'edition-123'
        }
      }
    }
  }

  const getParentVideoLabelMock = {
    request: {
      query: GET_PARENT_VIDEO_LABEL,
      variables: {
        videoId: mockParentId
      }
    },
    result: {
      data: {
        adminVideo: {
          id: mockParentId,
          label: 'series',
          origin: {
            id: 'origin-1'
          }
        }
      }
    }
  }

  describe('without a parent video', () => {
    beforeEach(() => {
      render(
        <MockedProvider
          mocks={[createVideoMock, createEditionMock, getVideoOriginsMock]}
        >
          <VideoCreateForm onCreateSuccess={mockOnCreateSuccess} />
        </MockedProvider>
      )
    })

    it('renders the form with the correct fields', async () => {
      expect(screen.getByTestId('VideoCreateForm')).toBeInTheDocument()

      // Wait for origins to load first since it's now the first field
      await waitFor(() => {
        expect(screen.getByLabelText(/Origin/i)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/ID/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Label/i)).toBeInTheDocument()
    })

    it('displays validation errors when submitting empty form', async () => {
      fireEvent.click(screen.getByText('Create'))

      await waitFor(() => {
        expect(screen.getByText('ID is required')).toBeInTheDocument()
        expect(screen.getByText('Slug is required')).toBeInTheDocument()
        expect(screen.getByText('Label is required')).toBeInTheDocument()
        expect(screen.getByText('Origin is required')).toBeInTheDocument()
      })
    })

    it('navigates to videos list when Cancel button is clicked', () => {
      fireEvent.click(screen.getByText('Cancel'))
      expect(mockRouterPush).toHaveBeenCalledWith('/videos')
    })
  })

  describe('with a parent video', () => {
    beforeEach(() => {
      render(
        <MockedProvider
          mocks={[
            createVideoMock,
            createEditionMock,
            getParentVideoLabelMock,
            getVideoOriginsMock
          ]}
        >
          <VideoCreateForm
            parentId={mockParentId}
            onCreateSuccess={mockOnCreateSuccess}
          />
        </MockedProvider>
      )
    })

    it('renders the form with parent information', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(
            /This video will be added as a child to video with ID: parent-123/
          )
        ).toBeInTheDocument()
      })
    })

    it('pre-selects episode label for series parent', async () => {
      await waitFor(() => {
        // Check that "Episode" is displayed in the label select field
        expect(screen.getByText('Episode')).toBeInTheDocument()

        // Also verify the hidden input has the correct value
        const hiddenInput = screen.getByDisplayValue('episode')
        expect(hiddenInput).toBeInTheDocument()
      })
    })

    it('navigates to parent video when Cancel button is clicked', () => {
      fireEvent.click(screen.getByText('Cancel'))
      expect(mockRouterPush).toHaveBeenCalledWith(`/videos/${mockParentId}`)
    })
  })

  describe('form submission', () => {
    it('successfully submits the form with valid data', async () => {
      const user = userEvent.setup()

      render(
        <MockedProvider
          mocks={[createVideoMock, createEditionMock, getVideoOriginsMock]}
        >
          <VideoCreateForm onCreateSuccess={mockOnCreateSuccess} />
        </MockedProvider>
      )

      // Wait for origins to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Origin/i)).toBeInTheDocument()
      })

      // Fill out the form
      await user.type(screen.getByLabelText(/ID/i), 'test-id')
      await user.type(screen.getByLabelText(/Slug/i), 'test-slug')

      // Select a label option
      const labelSelect = screen.getByLabelText(/Label/i)
      await user.click(labelSelect)
      await user.click(screen.getByText('Episode'))

      // Select an origin option
      const originSelect = screen.getByLabelText(/Origin/i)
      await user.click(originSelect)
      await user.click(screen.getByText('origin-1 - Jesus Film Project'))

      // Submit the form
      await user.click(screen.getByText('Create'))

      // Wait for the success callback
      await waitFor(() => {
        expect(mockOnCreateSuccess).toHaveBeenCalledWith('test-id')
      })
    })

    it('navigates to the new video page when successful without onCreateSuccess', async () => {
      const user = userEvent.setup()

      render(
        <MockedProvider
          mocks={[createVideoMock, createEditionMock, getVideoOriginsMock]}
        >
          <VideoCreateForm />
        </MockedProvider>
      )

      // Wait for origins to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Origin/i)).toBeInTheDocument()
      })

      // Fill out the form
      await user.type(screen.getByLabelText(/ID/i), 'test-id')
      await user.type(screen.getByLabelText(/Slug/i), 'test-slug')

      // Select a label option
      const labelSelect = screen.getByLabelText(/Label/i)
      await user.click(labelSelect)
      await user.click(screen.getByText('Episode'))

      // Select an origin option
      const originSelect = screen.getByLabelText(/Origin/i)
      await user.click(originSelect)
      await user.click(screen.getByText('origin-1 - Jesus Film Project'))

      // Submit the form
      await user.click(screen.getByText('Create'))

      // Check router was called with correct path
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/videos/test-id')
      })
    })
  })

  describe('error handling', () => {
    const duplicateIdErrorMock = {
      request: {
        query: CREATE_VIDEO,
        variables: {
          input: {
            id: 'duplicate-id',
            slug: 'test-slug',
            label: 'episode',
            originId: 'origin-1',
            primaryLanguageId: '529',
            noIndex: false,
            published: false,
            childIds: []
          }
        }
      },
      result: {
        errors: [
          {
            message: 'Video ID already exists',
            extensions: {
              code: 'NotUniqueError',
              location: [
                {
                  path: ['input', 'id'],
                  value: 'duplicate-id'
                }
              ]
            }
          }
        ]
      }
    }

    const duplicateSlugErrorMock = {
      request: {
        query: CREATE_VIDEO,
        variables: {
          input: {
            id: 'test-id',
            slug: 'duplicate-slug',
            label: 'episode',
            originId: 'origin-1',
            primaryLanguageId: '529',
            noIndex: false,
            published: false,
            childIds: []
          }
        }
      },
      result: {
        errors: [
          {
            message: 'Video slug already exists',
            extensions: {
              code: 'NotUniqueError',
              location: [
                {
                  path: ['input', 'slug'],
                  value: 'duplicate-slug'
                }
              ]
            }
          }
        ]
      }
    }

    it('displays specific error message for duplicate ID', async () => {
      const mockEnqueueSnackbar = jest.fn()

      // Mock notistack for this test
      const { useSnackbar } = require('notistack')
      useSnackbar.mockReturnValue({
        enqueueSnackbar: mockEnqueueSnackbar
      })

      const user = userEvent.setup()

      render(
        <MockedProvider mocks={[duplicateIdErrorMock, getVideoOriginsMock]}>
          <VideoCreateForm />
        </MockedProvider>
      )

      // Wait for origins to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Origin/i)).toBeInTheDocument()
      })

      // Fill out the form with duplicate ID
      await user.type(screen.getByLabelText(/ID/i), 'duplicate-id')
      await user.type(screen.getByLabelText(/Slug/i), 'test-slug')

      // Select a label option
      const labelSelect = screen.getByLabelText(/Label/i)
      await user.click(labelSelect)
      await user.click(screen.getByText('Episode'))

      // Select an origin option
      const originSelect = screen.getByLabelText(/Origin/i)
      await user.click(originSelect)
      await user.click(screen.getByText('origin-1 - Jesus Film Project'))

      // Submit the form
      await user.click(screen.getByText('Create'))

      // Wait for error message
      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          'This ID is already in use. Please choose a different ID.',
          { variant: 'error' }
        )
      })
    })

    it('displays specific error message for duplicate slug', async () => {
      const mockEnqueueSnackbar = jest.fn()

      // Mock notistack for this test
      const { useSnackbar } = require('notistack')
      useSnackbar.mockReturnValue({
        enqueueSnackbar: mockEnqueueSnackbar
      })

      const user = userEvent.setup()

      render(
        <MockedProvider mocks={[duplicateSlugErrorMock, getVideoOriginsMock]}>
          <VideoCreateForm />
        </MockedProvider>
      )

      // Wait for origins to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Origin/i)).toBeInTheDocument()
      })

      // Fill out the form with duplicate slug
      await user.type(screen.getByLabelText(/ID/i), 'test-id')
      await user.type(screen.getByLabelText(/Slug/i), 'duplicate-slug')

      // Select a label option
      const labelSelect = screen.getByLabelText(/Label/i)
      await user.click(labelSelect)
      await user.click(screen.getByText('Episode'))

      // Select an origin option
      const originSelect = screen.getByLabelText(/Origin/i)
      await user.click(originSelect)
      await user.click(screen.getByText('origin-1 - Jesus Film Project'))

      // Submit the form
      await user.click(screen.getByText('Create'))

      // Wait for error message
      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          'This slug is already in use. Please choose a different slug.',
          { variant: 'error' }
        )
      })
    })
  })
})
