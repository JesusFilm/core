import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { EditProvider } from '../../../_EditProvider'

import { UPDATE_VIDEO_DESCRIPTION, VideoDescription } from './VideoDescription'
import { mockVideoDescriptions } from './VideoDescription.data'

describe('VideoDescription', () => {
  const mockUpdateVideoDescription = {
    request: {
      query: UPDATE_VIDEO_DESCRIPTION,
      variables: {
        input: {
          id: 'videoDescription.1',
          value: 'new description text'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        videoDescriptionUpdate: {
          id: 'videoDescription.1',
          value: 'new description text'
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
            <VideoDescription videoDescriptions={mockVideoDescriptions} />
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
            <VideoDescription videoDescriptions={mockVideoDescriptions} />
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
            <VideoDescription videoDescriptions={mockVideoDescriptions} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should enable save button if description has been changed', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription videoDescriptions={mockVideoDescriptions} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video description 1 text')
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
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription videoDescriptions={mockVideoDescriptions} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video description 1 text')
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

  it('should not call update if there is no video data', async () => {
    render(
      <MockedProvider mocks={[mockUpdateVideoDescription]}>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription videoDescriptions={mockVideoDescriptions} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new description text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('new description text')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateVideoDescription.result).not.toHaveBeenCalled()
    )
  })

  it('should require description field', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider initialState={{ isEdit: true }}>
            <VideoDescription videoDescriptions={mockVideoDescriptions} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('Video description 1 text')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
