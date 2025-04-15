import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  CREATE_EDITION,
  CREATE_VIDEO,
  GET_PARENT_VIDEO_LABEL,
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
  const createVideoMock = {
    request: {
      query: CREATE_VIDEO,
      variables: {
        input: {
          id: 'test-id',
          slug: 'test-slug',
          label: 'episode',
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
          label: 'series'
        }
      }
    }
  }

  describe('without a parent video', () => {
    beforeEach(() => {
      render(
        <MockedProvider mocks={[createVideoMock, createEditionMock]}>
          <VideoCreateForm onCreateSuccess={mockOnCreateSuccess} />
        </MockedProvider>
      )
    })

    it('renders the form with the correct fields', () => {
      expect(screen.getByTestId('VideoCreateForm')).toBeInTheDocument()
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
      })
    })

    it('navigates to videos list when Cancel button is clicked', () => {
      fireEvent.click(screen.getByText('Cancel'))
      expect(mockRouterPush).toHaveBeenCalledWith('/videos', { scroll: false })
    })
  })

  describe('with a parent video', () => {
    beforeEach(() => {
      render(
        <MockedProvider
          mocks={[createVideoMock, createEditionMock, getParentVideoLabelMock]}
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

    it('shows suggested label explanation when parent video has a label', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Based on the parent/)).toBeInTheDocument()
      })
    })

    it('navigates to parent video when Cancel button is clicked', () => {
      fireEvent.click(screen.getByText('Cancel'))
      expect(mockRouterPush).toHaveBeenCalledWith(`/videos/${mockParentId}`, {
        scroll: false
      })
    })
  })

  describe('form submission', () => {
    it('successfully submits the form with valid data', async () => {
      const user = userEvent.setup()

      render(
        <MockedProvider mocks={[createVideoMock, createEditionMock]}>
          <VideoCreateForm onCreateSuccess={mockOnCreateSuccess} />
        </MockedProvider>
      )

      // Fill out the form
      await user.type(screen.getByLabelText(/ID/i), 'test-id')
      await user.type(screen.getByLabelText(/Slug/i), 'test-slug')

      // Select a label option
      const labelSelect = screen.getByLabelText(/Label/i)
      await user.click(labelSelect)
      await user.click(screen.getByText('Episode'))

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
        <MockedProvider mocks={[createVideoMock, createEditionMock]}>
          <VideoCreateForm />
        </MockedProvider>
      )

      // Fill out the form
      await user.type(screen.getByLabelText(/ID/i), 'test-id')
      await user.type(screen.getByLabelText(/Slug/i), 'test-slug')

      // Select a label option
      const labelSelect = screen.getByLabelText(/Label/i)
      await user.click(labelSelect)
      await user.click(screen.getByText('Episode'))

      // Submit the form
      await user.click(screen.getByText('Create'))

      // Check router was called with correct path
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/videos/test-id', {
          scroll: false
        })
      })
    })
  })
})
