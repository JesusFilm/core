import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { EditProvider } from '../../../_EditProvider'

import { UPDATE_VIDEO_SNIPPET, VideoSnippet } from './VideoSnippet'
import { mockVideoSnippets } from './VideoSnippet.data'

describe('VideoSnippet', () => {
  const mockUpdateVideoSnippet = {
    request: {
      query: UPDATE_VIDEO_SNIPPET,
      variables: {
        input: {
          id: 'videoSnippet.1',
          value: 'new snippet text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoSnippetUpdate: {
          id: 'videoSnippet.1',
          value: 'new snippet text'
        }
      }
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should disable field if not in edit mode', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: false }}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should not show save button when not in edit mode', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: false }}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(
      screen.queryByRole('button', { name: 'Save' })
    ).not.toBeInTheDocument()
  })

  it('should show disabled save button in edit mode by default', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if snippet has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video snippet 1 text')
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
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video snippet 1 text')
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
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet videoSnippets={mockVideoSnippets} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video snippet 1 text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Snippet is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
