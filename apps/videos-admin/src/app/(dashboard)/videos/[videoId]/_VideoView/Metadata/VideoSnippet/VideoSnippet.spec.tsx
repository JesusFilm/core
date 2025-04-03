import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SnackbarProvider } from '../../../../../../../libs/SnackbarProvider'
import { GetAdminVideo_AdminVideo_VideoSnippets as VideoSnippets } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../libs/VideoProvider'

import {
  CREATE_VIDEO_SNIPPET,
  UPDATE_VIDEO_SNIPPET,
  VideoSnippet
} from './VideoSnippet'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']

const mockCreateVideoSnippet = {
  request: {
    query: CREATE_VIDEO_SNIPPET,
    variables: {
      input: {
        videoId: mockVideo.id,
        value: 'new snippet text',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      videoSnippetCreate: {
        id: 'snippet.id',
        value: 'new snippet text'
      }
    }
  }))
}

describe('VideoSnippet', () => {
  const mockUpdateVideoSnippet = {
    request: {
      query: UPDATE_VIDEO_SNIPPET,
      variables: {
        input: {
          id: 'e3645175-c05b-4760-a0ac-fdcb894655be',
          value: 'new snippet text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoSnippetUpdate: {
          id: 'e3645175-c05b-4760-a0ac-fdcb894655be',
          value: 'new snippet text'
        }
      }
    }))
  }

  const mockVideoSnippets: VideoSnippets =
    useAdminVideoMock['result']?.['data']?.['adminVideo']?.['snippet']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show disabled save button when values have not been changed', () => {
    render(
      <MockedProvider>
        
          <VideoProvider video={mockVideo}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </VideoProvider>
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable form buttons if snippet has been changed', async () => {
    render(
      <MockedProvider>
        
          <VideoProvider video={mockVideo}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </VideoProvider>
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should create video snippet if none exists', async () => {
    render(
      
        <MockedProvider mocks={[mockCreateVideoSnippet]}>
          <SnackbarProvider>
            <VideoProvider video={mockVideo}>
              <VideoSnippet videoSnippets={[]} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      
    )

    const user = userEvent.setup()

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('')

    await user.type(screen.getByRole('textbox'), 'new snippet text')

    expect(screen.getByRole('textbox')).toHaveValue('new snippet text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockCreateVideoSnippet.result).toHaveBeenCalled()
    )
    expect(mockUpdateVideoSnippet.result).not.toHaveBeenCalled()
    expect(
      screen.getByText('Video short description created')
    ).toBeInTheDocument()
  })

  it('should update video snippet on submit', async () => {
    render(
      
        <MockedProvider mocks={[mockUpdateVideoSnippet]}>
          <SnackbarProvider>
            <VideoProvider video={mockVideo}>
              <VideoSnippet videoSnippets={mockVideoSnippets} />
            </VideoProvider>
          </SnackbarProvider>
        </MockedProvider>
      
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new snippet text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('new snippet text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoSnippet.result).toHaveBeenCalled()
    )
    expect(
      screen.getByText('Video short description updated')
    ).toBeInTheDocument()
  })

  it('should require snippet field', async () => {
    render(
      <MockedProvider>
        
          <VideoProvider video={mockVideo}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </VideoProvider>
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Snippet is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should reset form when cancel is clicked', async () => {
    render(
      <MockedProvider>
        
          <VideoProvider video={mockVideo}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </VideoProvider>
        
      </MockedProvider>
    )
    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox')
    expect(textbox).toHaveValue(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )

    await user.clear(textbox)
    await user.type(textbox, 'Hello')
    expect(screen.getByRole('textbox')).toHaveValue('Hello')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(textbox).toHaveValue(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )
  })
})
