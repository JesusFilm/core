import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  CREATE_VIDEO_TITLE,
  UPDATE_VIDEO_INFORMATION,
  VideoInformation
} from './VideoInformation'

// Mock Next's navigation hooks
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock the notistack hook
const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

// Mock the useSuspenseQuery hook
jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    useSuspenseQuery: jest.fn((query, options) => {
      // Return mock data based on query variables
      if (options.variables.id === '1_jf-0-0') {
        // Check if we need to return empty title array
        if (query.definitions[0].__id === 'EmptyTitleTest') {
          return {
            data: {
              adminVideo: {
                id: '1_jf-0-0',
                label: 'featureFilm',
                published: true,
                slug: 'jesus',
                title: []
              }
            }
          }
        }

        // Return default data
        return {
          data: {
            adminVideo: {
              id: '1_jf-0-0',
              label: 'featureFilm',
              published: true,
              slug: 'jesus',
              title: [
                {
                  id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
                  value: 'JESUS'
                }
              ]
            }
          }
        }
      }
      return originalModule.useSuspenseQuery(query, options)
    })
  }
})

const mockVideoId = '1_jf-0-0'

const mockCreateVideoTitle = {
  request: {
    query: CREATE_VIDEO_TITLE,
    variables: {
      input: {
        videoId: '1_jf-0-0',
        value: 'new title',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      videoTitleCreate: {
        id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
        value: 'new title'
      }
    }
  }))
}

describe('VideoInformation', () => {
  const mockUpdateVideoInformation = {
    request: {
      query: UPDATE_VIDEO_INFORMATION,
      variables: {
        titleInput: {
          id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
          value: 'new title'
        },
        infoInput: {
          id: '1_jf-0-0',
          slug: 'jesus',
          published: true,
          label: 'featureFilm'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoTitleUpdate: {
          id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
          value: 'new title'
        },
        videoUpdate: {
          id: '1_jf-0-0',
          slug: 'jesus',
          published: true,
          label: 'featureFilm'
        }
      }
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset useSuspenseQuery mock implementation for each test
    const apolloModule = require('@apollo/client')
    apolloModule.useSuspenseQuery.mockImplementation((query, options) => {
      if (options.variables.id === '1_jf-0-0') {
        return {
          data: {
            adminVideo: {
              id: '1_jf-0-0',
              label: 'featureFilm',
              published: true,
              slug: 'jesus',
              title: [
                {
                  id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
                  value: 'JESUS'
                }
              ]
            }
          }
        }
      }
    })
  })

  it('should show disabled save button if values not changed', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if title field has been changed', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should enable save button if status has been changed', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status' }))
    fireEvent.click(screen.getByRole('option', { name: 'Draft' }))
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Draft'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should enable form buttons if label has been changed', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))
    fireEvent.click(screen.getByRole('option', { name: 'Short Film' }))
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveTextContent(
      'Short Film'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should create video title if none exists', async () => {
    // Update the mock for this specific test
    const apolloModule = require('@apollo/client')
    apolloModule.useSuspenseQuery.mockImplementation((query, options) => {
      if (options.variables.id === '1_jf-0-0') {
        return {
          data: {
            adminVideo: {
              id: '1_jf-0-0',
              label: 'featureFilm',
              published: true,
              slug: 'jesus',
              title: []
            }
          }
        }
      }
    })

    render(
      <MockedProvider
        mocks={[mockCreateVideoTitle, mockUpdateVideoInformation]}
      >
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Title' })
    expect(textbox).toHaveValue('')

    await user.type(textbox, 'new title')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockCreateVideoTitle.result).toHaveBeenCalled()
    })
    expect(mockUpdateVideoInformation.result).toHaveBeenCalled()

    // Verify the router was called with the appropriate parameters during form submission
    expect(mockPush).toHaveBeenCalledWith('?update=information', {
      scroll: false
    })
    expect(mockPush).toHaveBeenLastCalledWith('?', { scroll: false })
  })

  it('should update video information on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'new title' }
    })
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
      'new title'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoInformation.result).toHaveBeenCalled()
    )

    // Verify router was called correctly
    expect(mockPush).toHaveBeenCalledWith('?update=information', {
      scroll: false
    })
    expect(mockPush).toHaveBeenLastCalledWith('?', { scroll: false })

    // Verify snackbar was called on success
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'Successfully updated video information',
      { variant: 'success' }
    )
  })

  it('should require title field', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should reset form when cancel button is clicked', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    const user = userEvent.setup()

    const title = screen.getByRole('textbox', { name: 'Title' })
    const status = screen.getByRole('combobox', { name: 'Status' })
    const label = screen.getByRole('combobox', { name: 'Label' })

    expect(title).toHaveValue('JESUS')
    expect(status).toHaveTextContent('Published')
    expect(label).toHaveTextContent('Feature Film')

    await user.clear(title)
    await user.type(title, 'Title')

    await user.click(status)
    await user.click(screen.getByRole('option', { name: 'Draft' }))

    await user.click(label)
    await user.click(screen.getByRole('option', { name: 'Short Film' }))

    expect(title).toHaveValue('Title')
    expect(status).toHaveTextContent('Draft')
    expect(label).toHaveTextContent('Short Film')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(title).toHaveValue('JESUS')
    expect(status).toHaveTextContent('Published')
    expect(label).toHaveTextContent('Feature Film')
  })
})
