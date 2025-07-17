import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { graphql } from '@core/shared/gql'

import { ExistingVideoByIdSelector } from './ExistingVideoByIdSelector'

const GET_VIDEO_BY_ID = graphql(`
  query GetVideoById($id: ID!) {
    adminVideo(id: $id) {
      id
      title {
        primary
        value
      }
    }
  }
`)

describe('ExistingVideoByIdSelector', () => {
  const handleSelect = jest.fn()
  const handleCancel = jest.fn()

  const mocks = [
    {
      request: {
        query: GET_VIDEO_BY_ID,
        variables: { id: 'video123' }
      },
      result: {
        data: {
          adminVideo: {
            id: 'video123',
            title: [{ primary: true, value: 'Test Video' }]
          }
        }
      }
    },
    {
      request: {
        query: GET_VIDEO_BY_ID,
        variables: { id: 'nonexistent' }
      },
      error: new Error('Video not found')
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component correctly', () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoByIdSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    expect(screen.getByLabelText('Video ID')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('shows an error message when trying to submit without an ID', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoByIdSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    const submitButton = screen.getByRole('button', { name: 'Save' })

    // Button should be disabled when ID is empty
    expect(submitButton).toBeDisabled()

    // Enter an ID to enable the button
    const idInput = screen.getByLabelText('Video ID')
    await userEvent.type(idInput, ' ')
    await userEvent.clear(idInput)

    // Button should be disabled again
    expect(submitButton).toBeDisabled()
  })

  it('fetches and displays video details when a valid ID is entered', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoByIdSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    const idInput = screen.getByLabelText('Video ID')
    await userEvent.type(idInput, 'video123')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    expect(submitButton).not.toBeDisabled()

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Video found:')).toBeInTheDocument()
      expect(screen.getByText('Test Video')).toBeInTheDocument()
    })
  })

  it('shows an error message when video is not found', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoByIdSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    const idInput = screen.getByLabelText('Video ID')
    await userEvent.type(idInput, 'nonexistent')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Video not found. Please check the ID and try again.')
      ).toBeInTheDocument()
    })
  })

  it('calls onSelect when a valid video is found', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoByIdSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    const idInput = screen.getByLabelText('Video ID')
    await userEvent.type(idInput, 'video123')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith('video123')
    })
  })

  it('calls onCancel when clicking the Cancel button', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoByIdSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(handleCancel).toHaveBeenCalled()
  })
})
