import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { type MockedFunction } from 'vitest'

import { GoogleCreateIntegration } from './GoogleCreateIntegration'
import { useIntegrationGoogleCreate } from './libs/useIntegrationGoogleCreate'

import '../../../../test/i18n'

vi.mock('next/router', () => ({
  useRouter: vi.fn()
}))

vi.mock('./libs/useIntegrationGoogleCreate', () => ({
  useIntegrationGoogleCreate: vi.fn()
}))

vi.mock('notistack', () => ({
  __esModule: true,
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSnackbar: vi.fn()
}))

vi.mock('../../../libs/googleOAuthUrl', () => ({
  getGoogleOAuthUrl: vi.fn(
    (teamId: string) => `https://example.com/oauth?teamId=${teamId}`
  )
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>
const mockUseIntegrationGoogleCreate =
  useIntegrationGoogleCreate as MockedFunction<
    typeof useIntegrationGoogleCreate
  >
const mockUseSnackbar = useSnackbar as MockedFunction<typeof useSnackbar>

describe('GoogleCreateIntegration', () => {
  const mockReplace = vi.fn()
  const mockEnqueueSnackbar = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId' },
      replace: mockReplace
    } as unknown as ReturnType<typeof useRouter>)
    mockUseIntegrationGoogleCreate.mockReturnValue({ loading: false })
    mockUseSnackbar.mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: vi.fn()
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

    expect(mockReplace).toHaveBeenCalledWith('/teams/teamId/integrations')
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Google settings saved', {
      variant: 'success',
      preventDuplicate: true
    })
  })

  it('should navigate to returnTo path on onSuccess when returnTo is set', async () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId', returnTo: '/custom/path' },
      replace: mockReplace
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onSuccess } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onSuccess?.('integrationId')

    expect(mockReplace).toHaveBeenCalledWith('/custom/path')
  })

  it('should append integrationCreated param when returnTo includes openSyncDialog', async () => {
    mockUseRouter.mockReturnValue({
      query: {
        teamId: 'teamId',
        returnTo: '/journeys/journeyId?openSyncDialog=true'
      },
      replace: mockReplace
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onSuccess } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onSuccess?.('integrationId')

    expect(mockReplace).toHaveBeenCalledWith(
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
    expect(mockReplace).toHaveBeenCalledWith('/teams/teamId/integrations')
  })

  it('should navigate to returnTo path on onError when returnTo is set', async () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId', returnTo: '/custom/path' },
      replace: mockReplace
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onError } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onError?.(new Error('fail'))

    expect(mockReplace).toHaveBeenCalledWith('/custom/path')
  })

  it('should fall back to integrations page when returnTo is an unsafe URL on onSuccess', async () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId', returnTo: 'https://evil.com' },
      replace: mockReplace
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onSuccess } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onSuccess?.('integrationId')

    expect(mockReplace).toHaveBeenCalledWith('/teams/teamId/integrations')
  })

  it('should fall back to integrations page when returnTo is an unsafe URL on onError', async () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId', returnTo: '//evil.com' },
      replace: mockReplace
    } as unknown as ReturnType<typeof useRouter>)

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <GoogleCreateIntegration />
      </MockedProvider>
    )

    const { onError } = mockUseIntegrationGoogleCreate.mock.calls[0][0]

    await onError?.(new Error('fail'))

    expect(mockReplace).toHaveBeenCalledWith('/teams/teamId/integrations')
  })
})
