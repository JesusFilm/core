import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { GoogleCreateIntegration, INTEGRATION_GOOGLE_CREATE } from './GoogleCreateIntegration'

import '../../../../test/i18n'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

jest.mock('../../../libs/googleOAuthUrl', () => ({
  getGoogleOAuthUrl: jest.fn((teamId: string) => `https://example.com/oauth?teamId=${teamId}`)
}))

describe('GoogleCreateIntegration', () => {
  function renderComponent(): ReturnType<typeof render> {
    (useRouter as jest.Mock).mockReturnValue({
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

    const button = getByRole('button', { name: 'Connect with Google' })
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
              code: undefined,
              redirectUri: undefined
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
      query: { teamId: 'teamId' },
      push: jest.fn()
    })

    const { getByRole } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SnackbarProvider>
          <GoogleCreateIntegration />
        </SnackbarProvider>
      </MockedProvider>
    )

    const button = getByRole('button', { name: 'Connect with Google' })

    fireEvent.click(button)

    expect(button).toBeDisabled()

    await waitFor(() => expect(mutationCalled.called).toBe(true))
  })
})

