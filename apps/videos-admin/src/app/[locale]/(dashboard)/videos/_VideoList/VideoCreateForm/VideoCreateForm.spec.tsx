import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import {
  CREATE_VIDEO,
  CreateVideo,
  CreateVideoVariables,
  VideoCreateForm
} from './VideoCreateForm'

const createVideoMock: MockedResponse<CreateVideo, CreateVideoVariables> = {
  request: {
    query: CREATE_VIDEO,
    variables: {
      input: {
        id: 'test_video',
        slug: 'test_video_slug',
        label: 'shortFilm',
        primaryLanguageId: '529',
        published: false,
        noIndex: false,
        childIds: []
      }
    }
  },
  result: {
    data: {
      videoCreate: {
        id: 'test_video'
      }
    }
  }
}

describe('VideoCreateForm', () => {
  const mockCancel = jest.fn()

  it('should render form', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoCreateForm onCancel={mockCancel} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('textbox', { name: 'ID' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Slug' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Label' })).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Primary Language' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should emit cancel callback on cancel', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoCreateForm onCancel={mockCancel} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockCancel).toHaveBeenCalled()
  })

  it('should require all fields', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoCreateForm onCancel={mockCancel} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('ID is required')).toBeInTheDocument()
    expect(screen.getByText('Slug is required')).toBeInTheDocument()
    expect(screen.getByText('Label is required')).toBeInTheDocument()
    expect(screen.getByText('Primary language is required')).toBeInTheDocument()
  })

  it('should create a video', async () => {
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)
    const createVideoMockResult = jest
      .fn()
      .mockReturnValue(createVideoMock.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            { ...getLanguagesMock, result: getLanguagesMockResult },
            { ...createVideoMock, result: createVideoMockResult }
          ]}
        >
          <VideoCreateForm onCancel={mockCancel} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: 'ID' }), 'test_video')
    await user.type(
      screen.getByRole('textbox', { name: 'Slug' }),
      'test_video_slug'
    )

    await user.click(screen.getByRole('combobox', { name: 'Label' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Short Film' }))
    })

    await user.click(screen.getByRole('combobox', { name: 'Primary Language' }))
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(createVideoMockResult).toHaveBeenCalled()
  })
})
