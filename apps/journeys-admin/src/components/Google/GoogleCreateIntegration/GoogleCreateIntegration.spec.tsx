import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'

import { GoogleCreateIntegration } from './GoogleCreateIntegration'
import { useIntegrationGoogleCreate } from './libs/useIntegrationGoogleCreate'

import '../../../../test/i18n'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('./libs/useIntegrationGoogleCreate', () => ({
  useIntegrationGoogleCreate: jest.fn()
}))

jest.mock('notistack', () => ({
  __esModule: true,
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSnackbar: jest.fn()
}))

jest.mock('../../../libs/googleOAuthUrl', () => ({
  getGoogleOAuthUrl: jest.fn(
    (teamId: string) => `https://example.com/oauth?teamId=${teamId}`
  )
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseIntegrationGoogleCreate =
  useIntegrationGoogleCreate as jest.MockedFunction<
    typeof useIntegrationGoogleCreate
  >
const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>

describe('GoogleCreateIntegration', () => {
  const mockPush = jest.fn()
  const mockEnqueueSnackbar = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId' },
      push: mockPush
    } as unknown as ReturnType<typeof useRouter>)
    mockUseIntegrationGoogleCreate.mockReturnValue({ loading: false })
    mockUseSnackbar.mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: jest.fn()
    })
  })

  it('renders the connect button enabled when oauth url is available', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const button = screen.getByRole('link', { name: 'Connect with Google' })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('should disable the button when loading', () => {
    mockUseIntegrationGoogleCreate.mockReturnValue({ loading: true })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const button = screen.getByRole('link', { name: 'Connect with Google' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows success snackbar and navigates on onSuccess', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onSuccess } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onSuccess?.('integrationId')

    expect(mockPush).toHaveBeenCalledWith('/teams/teamId/integrations')
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Google settings saved', {
      variant: 'success',
      preventDuplicate: true
    })
  })

  it('should navigate to returnTo path on onSuccess when returnTo is set', async () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId', returnTo: '/custom/path' },
      push: mockPush
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onSuccess } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onSuccess?.('integrationId')

    expect(mockPush).toHaveBeenCalledWith('/custom/path')
  })

  it('should append integrationCreated param when returnTo includes openSyncDialog', async () => {
    mockUseRouter.mockReturnValue({
      query: {
        teamId: 'teamId',
        returnTo: '/journeys/journeyId?openSyncDialog=true'
      },
      push: mockPush
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onSuccess } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onSuccess?.('integrationId')

    expect(mockPush).toHaveBeenCalledWith(
      '/journeys/journeyId?openSyncDialog=true&integrationCreated=true'
    )
  })

  it('should show error snackbar and navigates on onError', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onError } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onError?.(new Error('Something went wrong'))

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Something went wrong', {
      variant: 'error',
      preventDuplicate: true
    })
    expect(mockPush).toHaveBeenCalledWith('/teams/teamId/integrations')
  })

  it('should navigate to returnTo path on onError when returnTo is set', async () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId', returnTo: '/custom/path' },
      push: mockPush
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onError } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onError?.(new Error('fail'))

    expect(mockPush).toHaveBeenCalledWith('/custom/path')
  })
})
