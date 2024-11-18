import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { useParams } from 'next/navigation'

import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../../_EditProvider'
import { VideoSnippet, UPDATE_VIDEO_SNIPPET } from './VideoSnippet'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: jest.fn()
}))

const mockUseParams = useParams as jest.MockedFunction<typeof mockUseParams>

describe('VideoSnippet', () => {
  const mockUpdateVideoSnippet = {
    request: {
      query: UPDATE_VIDEO_SNIPPET,
      variables: {
        input: {
          id: 'f4634713-33c2-43b6-b2e1-47263037c871',
          value: 'video snippet text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoSnippetUpdate: {
          id: 'f4634713-33c2-43b6-b2e1-47263037c871',
          value: 'video snippet text'
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
            <VideoSnippet />
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
            <VideoSnippet />
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
            <VideoSnippet />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if snippet has been changed', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Jesus snippet text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should update video snippet on submit', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider
        mocks={[{ ...useAdminVideoMock, result }, mockUpdateVideoSnippet]}
      >
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Jesus snippet text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'video snippet text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('video snippet text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoSnippet.result).toHaveBeenCalled()
    )
  })

  it('should not call update if there is no video data', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[mockUpdateVideoSnippet]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'video snippet text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('video snippet text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoSnippet.result).not.toHaveBeenCalled()
    )
  })

  it('should require snippet field', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoSnippet />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Jesus snippet text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Snippet is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
