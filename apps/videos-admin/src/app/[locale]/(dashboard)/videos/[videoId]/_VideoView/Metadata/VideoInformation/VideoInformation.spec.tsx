import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../../_EditProvider'

import { UPDATE_VIDEO_INFORMATION, VideoInformation } from './VideoInfomation'

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
          label: 'featureFilm',
          noIndex: false
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
          label: 'featureFilm',
          noIndex: false
        }
      }
    }))
  }

  const mockVideo: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should disable all fields if not in edit mode', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: false }}>
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox', { name: 'Title' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Slug' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(screen.getByRole('checkbox', { name: 'No Index' })).toBeDisabled()
  })

  it('should not show save button when not in edit mode', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: false }}>
            <VideoInformation video={mockVideo} />
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
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if title field has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('JESUS')
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Hello' }
    })
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Hello')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should enable save button if status has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status' }))
    fireEvent.click(screen.getByRole('option', { name: 'Unpublished' }))
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Unpublished'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should enable save button if label has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Label' }))
    fireEvent.click(screen.getByRole('option', { name: 'Short Film' }))
    expect(screen.getByRole('combobox', { name: 'Label' })).toHaveTextContent(
      'Short Film'
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should enable save button if no index has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'No Index' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'No Index' }))
    expect(screen.getByRole('checkbox', { name: 'No Index' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('should update video information on submit', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoInformation]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
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
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoInformation video={mockVideo} />
          </EditProvider>
        </NextIntlClientProvider>
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
})
