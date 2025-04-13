import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _unescape from 'lodash/unescape'

import { GetAdminVideo_AdminVideo_VideoDescriptions as VideoDescriptions } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { VideoProvider } from '../../../../../../../libs/VideoProvider'

import {
  CREATE_VIDEO_DESCRIPTION,
  CreateVideoDescription,
  CreateVideoDescriptionVariables,
  UPDATE_VIDEO_DESCRIPTION,
  VideoDescription
} from './VideoDescription'

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']

const mockCreateVideoDescription: MockedResponse<
  CreateVideoDescription,
  CreateVideoDescriptionVariables
> = {
  request: {
    query: CREATE_VIDEO_DESCRIPTION,
    variables: {
      input: {
        videoId: mockVideo.id,
        value: 'new description text',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: {
    data: {
      videoDescriptionCreate: {
        id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
        value: 'new description text'
      }
    }
  }
}

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
        <VideoProvider video={mockVideo}>
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable form buttons if description has been changed', async () => {
    render(
      <MockedProvider>
        <VideoProvider video={mockVideo}>
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should create video description if none exists', async () => {
    const result = jest.fn().mockReturnValue(mockCreateVideoDescription.result)

    render(
      <MockedProvider
        mocks={[
          { ...mockCreateVideoDescription, result },
          mockUpdateVideoDescription
        ]}
      >
        <VideoProvider video={mockVideo}>
          <VideoDescription videoDescriptions={[]} />
        </VideoProvider>
      </MockedProvider>
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox')
    expect(screen.getByRole('textbox')).toHaveValue('')
    await user.type(textbox, 'new description text')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockUpdateVideoDescription.result).not.toHaveBeenCalled()
  })

  it('should update video description on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoDescription]}>
        <VideoProvider video={mockVideo}>
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
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
        <VideoProvider video={mockVideo}>
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should reset form when cancel is clicked', async () => {
    render(
      <MockedProvider>
        <VideoProvider video={mockVideo}>
          <VideoDescription videoDescriptions={mockVideoDescriptions} />
        </VideoProvider>
      </MockedProvider>
    )
    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox')

    expect(textbox).toHaveValue(
      _unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
    )

    await user.clear(textbox)
    await user.type(textbox, 'Hello')

    expect(screen.getByRole('textbox')).toHaveValue('Hello')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('textbox')).toHaveValue(
      _unescape(mockVideoDescriptions[0].value).replace(/&#13;/g, '\n')
    )
  })
})
