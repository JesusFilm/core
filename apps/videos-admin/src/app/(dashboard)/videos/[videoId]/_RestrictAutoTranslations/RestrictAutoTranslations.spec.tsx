import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import {
  GET_RESTRICT_AUTO_TRANSLATIONS,
  RestrictAutoTranslations,
  UPDATE_RESTRICT_AUTO_TRANSLATIONS
} from './RestrictAutoTranslations'

vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: vi.fn(
      (query: unknown, options?: { variables?: { id?: string } }) => {
        const id = options?.variables?.id
        return {
          data: {
            adminVideo: {
              id: id ?? 'video1',
              restrictAutoTranslations: id === 'video2'
            }
          }
        }
      }
    )
  }
})

const mockVideoWithRestrictionDisabled = [
  {
    request: {
      query: GET_RESTRICT_AUTO_TRANSLATIONS,
      variables: {
        id: 'video1'
      }
    },
    result: {
      data: {
        adminVideo: {
          id: 'video1',
          restrictAutoTranslations: false
        }
      }
    }
  }
]

const mockVideoWithRestrictionEnabled = [
  {
    request: {
      query: GET_RESTRICT_AUTO_TRANSLATIONS,
      variables: {
        id: 'video2'
      }
    },
    result: {
      data: {
        adminVideo: {
          id: 'video2',
          restrictAutoTranslations: true
        }
      }
    }
  }
]

const mockEnableMutation = {
  request: {
    query: UPDATE_RESTRICT_AUTO_TRANSLATIONS,
    variables: {
      input: {
        id: 'video1',
        restrictAutoTranslations: true
      }
    }
  },
  result: {
    data: {
      videoUpdate: {
        id: 'video1',
        restrictAutoTranslations: true
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

describe('RestrictAutoTranslations', () => {
  it('renders disabled when the restriction is off', async () => {
    render(
      <TestWrapper mocks={mockVideoWithRestrictionDisabled}>
        <RestrictAutoTranslations videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Restrict translations')).not.toBeChecked()
    })
  })

  it('renders locked when the restriction is on', async () => {
    render(
      <TestWrapper mocks={mockVideoWithRestrictionEnabled}>
        <RestrictAutoTranslations videoId="video2" />
      </TestWrapper>
    )

    await waitFor(() => {
      const switchInput = screen.getByLabelText('Restrict translations')
      expect(switchInput).toBeChecked()
      expect(switchInput).toBeDisabled()
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })
  })

  it('enables save and shows cancel when changed', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper mocks={[mockVideoWithRestrictionDisabled[0]]}>
        <RestrictAutoTranslations videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
      expect(
        screen.queryByRole('button', { name: /cancel/i })
      ).not.toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('Restrict translations'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })
  })

  it('saves when enabling the restriction', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper
        mocks={[...mockVideoWithRestrictionDisabled, mockEnableMutation]}
      >
        <RestrictAutoTranslations videoId="video1" />
      </TestWrapper>
    )

    await user.click(screen.getByLabelText('Restrict translations'))
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Successfully updated automatic translation restriction'
        )
      ).toBeInTheDocument()
    })
  })

  it('displays descriptive text about the feature', async () => {
    render(
      <TestWrapper mocks={mockVideoWithRestrictionDisabled}>
        <RestrictAutoTranslations videoId="video1" />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Once enabled, this restriction cannot be disabled/)
      ).toBeInTheDocument()
    })
  })
})
