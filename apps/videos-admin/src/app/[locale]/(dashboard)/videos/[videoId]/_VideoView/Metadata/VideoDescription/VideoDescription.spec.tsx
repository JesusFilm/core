import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import unescape from 'lodash/unescape'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo_VideoDescriptions as VideoDescriptions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { UPDATE_VIDEO_DESCRIPTION, VideoDescription } from './VideoDescription'

describe('VideoDescription', () => {
  const mockUpdateVideoDescription = {
    request: {
      query: UPDATE_VIDEO_DESCRIPTION,
      variables: {
        input: {
          id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
          value: 'new description text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoDescriptionUpdate: {
          id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
          value: 'new description text'
        }
      }
    }))
  }

  const mockVideoDescriptions: VideoDescriptions =
    useAdminVideoMock['result']?.['data']?.['adminVideo']?.['description']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show disabled save button by default is values not changed', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if description has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should update video description on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoDescription]}>
        <NextIntlClientProvider locale="en">
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new description text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('new description text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoDescription.result).toHaveBeenCalled()
    )
  })

  it('should require description field', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
