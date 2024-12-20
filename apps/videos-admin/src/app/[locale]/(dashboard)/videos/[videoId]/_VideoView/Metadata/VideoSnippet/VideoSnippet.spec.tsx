import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo_VideoSnippets as VideoSnippets } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { UPDATE_VIDEO_SNIPPET, VideoSnippet } from './VideoSnippet'

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
        <NextIntlClientProvider locale="en">
          <VideoSnippet videoSnippets={mockVideoSnippets} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if snippet has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoSnippet videoSnippets={mockVideoSnippets} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should update video snippet on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoSnippet]}>
        <NextIntlClientProvider locale="en">
          <VideoSnippet videoSnippets={mockVideoSnippets} />
        </NextIntlClientProvider>
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
  })

  it('should require snippet field', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoSnippet videoSnippets={mockVideoSnippets} />
        </NextIntlClientProvider>
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
})
