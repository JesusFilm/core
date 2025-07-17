import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { graphql } from '@core/shared/gql'

import { ExistingVideoSelector } from './ExistingVideoSelector'

const SEARCH_VIDEOS = graphql(`
  query SearchVideos($title: String!) {
    adminVideos(where: { title: $title }, limit: 20) {
      id
      title {
        primary
        value
      }
    }
  }
`)

describe('ExistingVideoSelector', () => {
  const handleSelect = jest.fn()
  const handleCancel = jest.fn()

  const mocks = [
    {
      request: {
        query: SEARCH_VIDEOS,
        variables: { title: 't' }
      },
      result: {
        data: {
          adminVideos: [
            {
              id: 'video1',
              title: [{ primary: true, value: 'Test Video 1' }]
            },
            {
              id: 'video2',
              title: [{ primary: true, value: 'Test Video 2' }]
            }
          ]
        }
      }
    },
    {
      request: {
        query: SEARCH_VIDEOS,
        variables: { title: 'te' }
      },
      result: {
        data: {
          adminVideos: [
            {
              id: 'video1',
              title: [{ primary: true, value: 'Test Video 1' }]
            },
            {
              id: 'video2',
              title: [{ primary: true, value: 'Test Video 2' }]
            }
          ]
        }
      }
    },
    {
      request: {
        query: SEARCH_VIDEOS,
        variables: { title: 'tes' }
      },
      result: {
        data: {
          adminVideos: [
            {
              id: 'video1',
              title: [{ primary: true, value: 'Test Video 1' }]
            },
            {
              id: 'video2',
              title: [{ primary: true, value: 'Test Video 2' }]
            }
          ]
        }
      }
    },
    {
      request: {
        query: SEARCH_VIDEOS,
        variables: { title: 'test' }
      },
      result: {
        data: {
          adminVideos: [
            {
              id: 'video1',
              title: [{ primary: true, value: 'Test Video 1' }]
            },
            {
              id: 'video2',
              title: [{ primary: true, value: 'Test Video 2' }]
            }
          ]
        }
      }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component correctly', () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    expect(screen.getByLabelText('Search videos by title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('searches for videos when typing in the search field', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    const searchInput = screen.getByLabelText('Search videos by title')
    await userEvent.type(searchInput, 'test')

    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument()
      expect(screen.getByText('Test Video 2')).toBeInTheDocument()
    })
  })

  it('calls onSelect when clicking the Save button after selecting a video', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoSelector
          onSelect={handleSelect}
          onCancel={handleCancel}
        />
      </MockedProvider>
    )

    const searchInput = screen.getByLabelText('Search videos by title')
    await userEvent.type(searchInput, 'test')

    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('Test Video 1'))

    // Button should be enabled now
    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).not.toBeDisabled()

    await userEvent.click(saveButton)

    expect(handleSelect).toHaveBeenCalledWith('video1')
  })

  it('calls onCancel when clicking the Cancel button', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <ExistingVideoSelector
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
