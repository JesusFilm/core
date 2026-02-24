import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import {
  GoogleCreateIntegration,
  INTEGRATION_GOOGLE_CREATE
} from './GoogleCreateIntegration'

import '../../../../test/i18n'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('notistack', () => ({
  __esModule: true,
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

jest.mock('../../../libs/googleOAuthUrl', () => ({
  getGoogleOAuthUrl: jest.fn(
    (teamId: string) => `https://example.com/oauth?teamId=${teamId}`
  )
}))

describe('GoogleCreateIntegration', () => {
  function renderComponent(): ReturnType<typeof render> {
    ;(useRouter as jest.Mock).mockReturnValue({
      query: { teamId: 'teamId' },
      push: jest.fn()
    })

    return render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SnackbarProvider>
          <GoogleCreateIntegration />
        </SnackbarProvider>
      </MockedProvider>
    )
  }

  it('renders the connect button enabled when oauth url is available', () => {
    const { getByRole } = renderComponent()

    const button = getByRole('link', { name: 'Connect with Google' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('disables the button when loading', async () => {
    const mutationCalled: { called: boolean } = { called: false }

    const mocks = [
      {
        request: {
          query: INTEGRATION_GOOGLE_CREATE,
          variables: {
            input: {
              teamId: 'teamId',
              code: 'auth-code',
              redirectUri: 'http://localhost/api/integrations/google/callback'
            }
          }
        },
        result: () => {
          mutationCalled.called = true

          return {
            data: {
              integrationGoogleCreate: {
                id: 'integrationId'
              }
            }
          }
        }
      }
    ]

    ;(useRouter as jest.Mock).mockReturnValue({
      query: { teamId: 'teamId', code: 'auth-code' },
      push: jest.fn()
    })

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SnackbarProvider>
          <GoogleCreateIntegration />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(mutationCalled.called).toBe(true))
  })
})
