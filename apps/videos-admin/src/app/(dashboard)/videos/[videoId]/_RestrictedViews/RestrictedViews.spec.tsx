import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import {
  GET_RESTRICTED_VIEWS,
  RestrictedViews,
  UPDATE_RESTRICTED_VIEWS
} from './RestrictedViews'

const mockVideoWithNoPlatforms = [
  {
    request: {
      query: GET_RESTRICTED_VIEWS,
      variables: {
        id: 'video1'
      }
    },
    result: {
      data: {
        adminVideo: {
          id: 'video1',
          restrictViewPlatforms: []
        }
      }
    }
  }
]

const mockVideoWithRestrictedPlatforms = [
  {
    request: {
      query: GET_RESTRICTED_VIEWS,
      variables: {
        id: 'video2'
      }
    },
    result: {
      data: {
        adminVideo: {
          id: 'video2',
          restrictViewPlatforms: ['arclight']
        }
      }
    }
  }
]

const mockUpdateMutation = {
  request: {
    query: UPDATE_RESTRICTED_VIEWS,
    variables: {
      input: {
        id: 'video1',
        restrictViewPlatforms: ['arclight']
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

describe('RestrictedViews', () => {
  it('should render without crashing', async () => {
    render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedViews videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Select platforms where viewing should be blocked/)
      ).toBeInTheDocument()
    })
  })

  it('should display platform checkboxes', async () => {
    render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedViews videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Arclight')).toBeInTheDocument()
      expect(screen.getByLabelText('Journeys')).toBeInTheDocument()
      expect(screen.getByLabelText('Watch')).toBeInTheDocument()
    })
  })

  it('should show pre-selected platforms', async () => {
    render(
      <TestWrapper mocks={mockVideoWithRestrictedPlatforms}>
        <RestrictedViews videoId="video2" />
      </TestWrapper>
    )

    await waitFor(() => {
      const arclightCheckbox = screen.getByLabelText('Arclight')
      const watchCheckbox = screen.getByLabelText('Watch')

      expect(arclightCheckbox).toBeChecked()
      expect(watchCheckbox).not.toBeChecked()
    })
  })

  it('should show cancel button when form is dirty', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedViews videoId="video1" />
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

  it('should update platforms when checkboxes are clicked', async () => {
    const user = userEvent.setup()
    const mocks = [...mockVideoWithNoPlatforms, mockUpdateMutation]

    render(
      <TestWrapper mocks={mocks}>
        <RestrictedViews videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Arclight')).toBeInTheDocument()
    })

    const arclightCheckbox = screen.getByLabelText('Arclight')
    const saveButton = screen.getByRole('button', { name: /save/i })

    await user.click(arclightCheckbox)
    await user.click(saveButton)

    await waitFor(() => {
      expect(arclightCheckbox).toBeChecked()
    })
  })

  it('should display correct description text', async () => {
    render(
      <TestWrapper mocks={mockVideoWithNoPlatforms}>
        <RestrictedViews videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Select platforms where viewing should be blocked/)
      ).toBeInTheDocument()
    })
  })
})
