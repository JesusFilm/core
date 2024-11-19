import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { useParams } from 'next/navigation'

import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../../_EditProvider'
import { VideoDescription, UPDATE_VIDEO_DESCRIPTION } from './VideoDescription'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: jest.fn()
}))

const mockUseParams = useParams as jest.MockedFunction<typeof mockUseParams>

describe('VideoDescription', () => {
  const mockUpdateVideoDescription = {
    request: {
      query: UPDATE_VIDEO_DESCRIPTION,
      variables: {
        input: {
          id: 'c1afff2e-057e-4e4a-a48c-11f005ffbb06',
          value: 'video description text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoDescriptionUpdate: {
          id: 'c1afff2e-057e-4e4a-a48c-11f005ffbb06',
          value: 'video description text'
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
            <VideoDescription />
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
            <VideoDescription />
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
            <VideoDescription />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if description has been changed', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Jesus description text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should update video description on submit', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider
        mocks={[{ ...useAdminVideoMock, result }, mockUpdateVideoDescription]}
      >
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Jesus description text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'video description text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('video description text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoDescription.result).toHaveBeenCalled()
    )
  })

  it('should not call update if there is no video data', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[mockUpdateVideoDescription]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'video description text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('video description text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoDescription.result).not.toHaveBeenCalled()
    )
  })

  it('should require description field', async () => {
    mockUseParams.mockReturnValue({ videoId: 'someId' })
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    render(
      <MockedProvider mocks={[{ ...useAdminVideoMock, result }]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Jesus description text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
