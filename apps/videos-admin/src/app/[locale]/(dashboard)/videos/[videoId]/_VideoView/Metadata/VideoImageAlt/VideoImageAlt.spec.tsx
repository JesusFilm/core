import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo_VideoImageAlts as VideoImageAlts } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { useVideoStore } from '../../../../../../../../libs/useVideoStore'

import {
  CREATE_VIDEO_IMAGE_ALT,
  UPDATE_VIDEO_IMAGE_ALT,
  VideoImageAlt
} from './VideoImageAlt'

jest.mock('../../../../../../../../libs/useVideoStore', () => ({
  useVideoStore: jest.fn()
}))

const mockCreateVideoImageAlt = {
  request: {
    query: CREATE_VIDEO_IMAGE_ALT,
    variables: {
      input: {
        videoId: 'video.id',
        value: 'new video image alt text',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      video: {
        id: 'e53b7688-f286-4743-983d-e8dacce35ad9',
        value: 'new video image alt text'
      }
    }
  }))
}

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

  it('should disable form buttons if values have not been changed', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
  })

  it('should enable form buttons if alt has changed', async () => {
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
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should create video image alt if none exists', async () => {
    ;(useVideoStore as unknown as jest.Mock).mockReturnValue({ id: 'video.id' })
    render(
      <MockedProvider
        mocks={[mockCreateVideoImageAlt, mockUpdateVideoImageAlt]}
      >
        <NextIntlClientProvider locale="en">
          <VideoImageAlt videoImageAlts={[]} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox')
    expect(textbox).toHaveValue('')

    await user.type(textbox, 'new video image alt text')
    expect(screen.getByRole('textbox')).toHaveValue('new video image alt text')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockCreateVideoImageAlt.result).toHaveBeenCalled()
    )
    expect(mockUpdateVideoImageAlt.result).not.toHaveBeenCalled()
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

  it('should reset form when cancel button is clicked', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoImageAlt videoImageAlts={mockVideoImageAlt} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox')
    expect(textbox).toHaveValue('JESUS')

    await user.type(textbox, ' Video')
    expect(textbox).toHaveValue('JESUS Video')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(textbox).toHaveValue('JESUS')
  })
})
