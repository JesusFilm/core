import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import {
  GET_RESTRICTED_DOWNLOADS,
  RestrictedDownloads,
  UPDATE_RESTRICTED_DOWNLOADS
} from './RestrictedDownloads'

const mockVideoWithNoPlatforms = [
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
          id: 'video1',
          restrictDownloadPlatforms: []
        }
      }
    }
  }
]

const mockVideoWithRestrictedPlatforms = [
  {
    request: {
      query: GET_RESTRICTED_DOWNLOADS,
      variables: {
        id: 'video2'
      }
    },
    result: {
      data: {
        adminVideo: {
          id: 'video2',
          restrictDownloadPlatforms: ['arclight']
        }
      }
    }
  }
]

const mockUpdateMutation = {
  request: {
    query: UPDATE_RESTRICTED_DOWNLOADS,
    variables: {
      input: {
        id: 'video1',
        restrictDownloadPlatforms: ['arclight']
      }
    }
  },
  result: {
    data: {
      videoUpdate: {
        id: 'video1'
      }
    }
  }
}

const TestWrapper = ({
  children,
  mocks
}: {
  children: React.ReactNode
  mocks: any[]
}) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <SnackbarProvider>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </SnackbarProvider>
  </MockedProvider>
)

describe('RestrictedDownloads', () => {
  it('should render without crashing', async () => {
    const { container } = render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedDownloads videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(container).toBeInTheDocument()
    })
  })

  it('should display platform checkboxes', async () => {
    render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedDownloads videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Arclight')).toBeInTheDocument()
      expect(screen.getByLabelText('Watch')).toBeInTheDocument()
    })
  })

  it('should show pre-selected platforms when video has restricted platforms', async () => {
    render(
      <TestWrapper mocks={mockVideoWithRestrictedPlatforms}>
        <RestrictedDownloads videoId="video2" />
      </TestWrapper>
    )

    await waitFor(() => {
      const arclightCheckbox = screen.getByLabelText('Arclight')
      const watchCheckbox = screen.getByLabelText('Watch')

      expect(arclightCheckbox).toBeChecked()
      expect(watchCheckbox).not.toBeChecked()
    })
  })

  it('should enable save button when form is dirty', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper mocks={[...mockVideoWithNoPlatforms, mockUpdateMutation]}>
        <RestrictedDownloads videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    const arclightCheckbox = screen.getByLabelText('Arclight')
    await user.click(arclightCheckbox)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
    })
  })

  it('should show cancel button when form is dirty', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedDownloads videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /cancel/i })
      ).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Arclight')).toBeInTheDocument()
    })

    const arclightCheckbox = screen.getByLabelText('Arclight')
    await user.click(arclightCheckbox)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })
  })

  it('should display descriptive text about the feature', async () => {
    render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedDownloads videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Select platforms where downloads should be blocked/)
      ).toBeInTheDocument()
    })
  })
})
