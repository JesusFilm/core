import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo_VideoImageAlts as VideoImageAlts } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { UPDATE_VIDEO_IMAGE_ALT, VideoImageAlt } from './VideoImageAlt'

describe('VideoImageAlt', () => {
  const mockUpdateVideoImageAlt = {
    request: {
      query: UPDATE_VIDEO_IMAGE_ALT,
      variables: {
        input: {
          id: 'e53b7688-f286-4743-983d-e8dacce35ad9',
          value: 'new video image alt text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        VideoImageAltUpdate: {
          id: 'e53b7688-f286-4743-983d-e8dacce35ad9',
          value: 'new video image alt text'
        }
      }
    }))
  }

  const mockVideoImageAlt: VideoImageAlts =
    useAdminVideoMock['result']?.['data']?.['adminVideo']?.['imageAlt']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show disabled save button if values have not been changed', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if image alt has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('JESUS')
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
          <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('JESUS')
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
          <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('JESUS')
    fireEvent.change(screen.getByRole('textbox', { name: 'Image Alt' }), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Image Alt is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
