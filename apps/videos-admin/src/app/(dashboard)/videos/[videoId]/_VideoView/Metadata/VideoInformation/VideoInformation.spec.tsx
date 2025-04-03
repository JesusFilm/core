import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import {
  CREATE_VIDEO_TITLE,
  UPDATE_VIDEO_INFORMATION,
  VideoInformation
} from './VideoInfomation'

const mockCreateVideoTitle = {
  request: {
    query: CREATE_VIDEO_TITLE,
    variables: {
      input: {
        videoId: '1_jf-0-0',
        value: 'new title',
        primary: true,
        languageId: '529'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      videoTitleCreate: {
        id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
        value: 'new title'
      }
    }
  }))
}

describe('VideoInformation', () => {
  const mockUpdateVideoInformation = {
    request: {
      query: UPDATE_VIDEO_INFORMATION,
      variables: {
        titleInput: {
          id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
          value: 'new title'
        },
        infoInput: {
          id: '1_jf-0-0',
          slug: 'jesus',
          published: true,
          label: 'featureFilm'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoTitleUpdate: {
          id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
          value: 'new title'
        },
        videoUpdate: {
          id: '1_jf-0-0',
          slug: 'jesus',
          published: true,
          label: 'featureFilm'
        }
      }
    }))
  }

  const mockVideo: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show disabled save button if values not changed', () => {
    render(
      <MockedProvider>
        
          <VideoInformation video={mockVideo} />
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if title field has been changed', async () => {
    render(
      <MockedProvider>
        
          <VideoInformation video={mockVideo} />
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should enable save button if status has been changed', async () => {
    render(
      <MockedProvider>
        
          <VideoInformation video={mockVideo} />
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status' }))
    fireEvent.click(screen.getByRole('option', { name: 'Draft' }))
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Draft'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should enable form buttons if label has been changed', async () => {
    render(
      <MockedProvider>
        
          <VideoInformation video={mockVideo} />
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))
    fireEvent.click(screen.getByRole('option', { name: 'Short Film' }))
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveTextContent(
      'Short Film'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should create video title if none exists', async () => {
    render(
      <MockedProvider
        mocks={[mockCreateVideoTitle, mockUpdateVideoInformation]}
      >
        
          <VideoInformation video={{ ...mockVideo, title: [] }} />
        
      </MockedProvider>
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Title' })
    expect(textbox).toHaveValue('')

    await user.type(textbox, 'new title')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockCreateVideoTitle.result).toHaveBeenCalled()
    })
    expect(mockUpdateVideoInformation.result).toHaveBeenCalled()
  })

  it('should update video information on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        
          <VideoInformation video={mockVideo} />
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'new title' }
    })
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
      'new title'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoInformation.result).toHaveBeenCalled()
    )
  })

  it('should require title field', async () => {
    render(
      <MockedProvider>
        
          <VideoInformation video={mockVideo} />
        
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should reset form when cancel button is clicked', async () => {
    render(
      <MockedProvider>
        
          <VideoInformation video={mockVideo} />
        
      </MockedProvider>
    )

    const user = userEvent.setup()

    const title = screen.getByRole('textbox', { name: 'Title' })
    const status = screen.getByRole('combobox', { name: 'Status' })
    const label = screen.getByRole('combobox', { name: 'Label' })

    expect(title).toHaveValue('JESUS')
    expect(status).toHaveTextContent('Published')
    expect(label).toHaveTextContent('Feature Film')

    await user.clear(title)
    await user.type(title, 'Title')

    await user.click(status)
    await user.click(screen.getByRole('option', { name: 'Draft' }))

    await user.click(label)
    await user.click(screen.getByRole('option', { name: 'Short Film' }))

    expect(title).toHaveValue('Title')
    expect(status).toHaveTextContent('Draft')
    expect(label).toHaveTextContent('Short Film')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(title).toHaveValue('JESUS')
    expect(status).toHaveTextContent('Published')
    expect(label).toHaveTextContent('Feature Film')
  })
})
