import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { EditProvider } from '../../../_EditProvider'

import { UPDATE_VIDEO_IMAGE_ALT, VideoImageAlt } from './VideoImageAlt'
import { mockVideoImageAlt } from './VideoImageAlt.data'

describe('VideoImageAlt', () => {
  const mockUpdateVideoImageAlt = {
    request: {
      query: UPDATE_VIDEO_IMAGE_ALT,
      variables: {
        input: {
          id: 'videoImageAlt.1',
          value: 'new video image alt text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        VideoImageAltUpdate: {
          id: 'videoImageAlt.1',
          value: 'new video image alt text'
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
            <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
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
            <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
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
            <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if image alt has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video image alt 1 text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should update video image alt on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoImageAlt]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video image alt 1 text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new video image alt text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('new video image alt text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoImageAlt.result).toHaveBeenCalled()
    )
  })

  it('should require image alt field', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video image alt 1 text')
    fireEvent.change(screen.getByRole('textbox', { name: 'Image Alt' }), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Image Alt is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
