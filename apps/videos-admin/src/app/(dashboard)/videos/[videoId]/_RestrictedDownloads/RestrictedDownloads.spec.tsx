import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GET_RESTRICTED_DOWNLOADS, RestrictedDownloads } from './RestrictedDownloads'

const mocks = [
  {
    request: {
      query: GET_RESTRICTED_DOWNLOADS,
      variables: {
        id: 'video1'
      }
    },
    result: {
      data: {
        adminVideo: {
          id: 'video1'
        }
      }
    }
  }
]

describe('RestrictedDownloads', () => {
  it('should render without crashing', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <RestrictedDownloads videoId="video1" />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(container).toBeInTheDocument()
  })
}) 