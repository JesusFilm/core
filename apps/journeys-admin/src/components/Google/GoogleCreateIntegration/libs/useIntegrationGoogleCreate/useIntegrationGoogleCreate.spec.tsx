import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { type MockedFunction } from 'vitest'

import { useAuth } from '../../../../../libs/auth'

import {
  INTEGRATION_GOOGLE_CREATE,
  useIntegrationGoogleCreate
} from './useIntegrationGoogleCreate'

vi.mock('next/router', () => ({
  useRouter: vi.fn()
}))

vi.mock('../../../../../libs/auth', () => ({
  useAuth: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>
const mockUseAuth = useAuth as MockedFunction<typeof useAuth>

function createWrapper(
  mocks: MockedResponse[] = []
): ({ children }: { children: ReactNode }) => JSX.Element {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    )
  }
}

const defaultRouter = {
  query: {},
  pathname: '/teams/[teamId]',
  replace: vi.fn(),
  push: vi.fn(),
  prefetch: vi.fn(),
  route: '',
  asPath: '',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  back: vi.fn(),
  beforePopState: vi.fn(),
  reload: vi.fn(),
  events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
  isFallback: false
} as unknown as ReturnType<typeof useRouter>

describe('useIntegrationGoogleCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: { id: 'user-id' } as any
    })
    mockUseRouter.mockReturnValue({ ...defaultRouter })
  })

  it('should return loading as false initially', () => {
    const { result } = renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId'
        }),
      { wrapper: createWrapper() }
    )

    expect(result.current.loading).toBe(false)
  })

  it('should not trigger mutation when code is absent', () => {
    const mutationMock: MockedResponse = {
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
      result: {
        data: { integrationGoogleCreate: { id: 'integrationId' } }
      }
    }

    renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId'
        }),
      { wrapper: createWrapper([mutationMock]) }
    )

    expect(defaultRouter.replace).not.toHaveBeenCalled()
  })

  it('should not trigger mutation when teamId is undefined', () => {
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' }
    })

    renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: undefined
        }),
      { wrapper: createWrapper() }
    )

    expect(defaultRouter.replace).not.toHaveBeenCalled()
  })

  it('should not trigger mutation when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null
    })
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' }
    })

    renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId'
        }),
      { wrapper: createWrapper() }
    )

    expect(defaultRouter.replace).not.toHaveBeenCalled()
  })

  it('should call mutation and onSuccess when code is present', async () => {
    const replace = vi.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onSuccess = vi.fn()

    const mutationMock: MockedResponse = {
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
      result: {
        data: { integrationGoogleCreate: { id: 'integrationId' } }
      }
    }

    const { result } = renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId',
          onSuccess
        }),
      { wrapper: createWrapper([mutationMock]) }
    )

    expect(replace).toHaveBeenCalledWith(
      { pathname: '/teams/[teamId]', query: {} },
      undefined,
      { shallow: true }
    )

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('integrationId')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should call onError when mutation returns no ID', async () => {
    const replace = vi.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onError = vi.fn()

    const mutationMock: MockedResponse = {
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
      result: {
        data: { integrationGoogleCreate: { id: null } }
      }
    }

    renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId',
          onError
        }),
      { wrapper: createWrapper([mutationMock]) }
    )

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        new Error('Integration creation returned no ID')
      )
    })
  })

  it('should call onError when mutation throws', async () => {
    const replace = vi.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onError = vi.fn()

    const mutationMock: MockedResponse = {
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
      error: new Error('Network error')
    }

    renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId',
          onError
        }),
      { wrapper: createWrapper([mutationMock]) }
    )

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error('Network error'))
    })
  })

  it('should strip code param from URL on trigger', () => {
    const replace = vi.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code', teamId: 'teamId' },
      replace
    })

    const mutationMock: MockedResponse = {
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
      result: {
        data: { integrationGoogleCreate: { id: 'integrationId' } }
      }
    }

    renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId'
        }),
      { wrapper: createWrapper([mutationMock]) }
    )

    expect(replace).toHaveBeenCalledWith(
      { pathname: '/teams/[teamId]', query: { teamId: 'teamId' } },
      undefined,
      { shallow: true }
    )
  })

  it('should not re-trigger mutation on rerender', async () => {
    const replace = vi.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onSuccess = vi.fn()

    const mutationMock: MockedResponse = {
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
      result: {
        data: { integrationGoogleCreate: { id: 'integrationId' } }
      }
    }

    const { rerender } = renderHook(
      () =>
        useIntegrationGoogleCreate({
          teamId: 'teamId',
          onSuccess
        }),
      { wrapper: createWrapper([mutationMock]) }
    )

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    rerender()

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
