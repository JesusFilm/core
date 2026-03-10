import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { ReactNode } from 'react'

import {
  INTEGRATION_GOOGLE_CREATE,
  useIntegrationGoogleCreate
} from './useIntegrationGoogleCreate'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-firebase-auth', () => ({
  useUser: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

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
  replace: jest.fn(),
  push: jest.fn(),
  prefetch: jest.fn(),
  route: '',
  asPath: '',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  back: jest.fn(),
  beforePopState: jest.fn(),
  reload: jest.fn(),
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  isFallback: false
} as unknown as ReturnType<typeof useRouter>

describe('useIntegrationGoogleCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUser.mockReturnValue({
      clientInitialized: true
    } as ReturnType<typeof useUser>)
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

  it('should not trigger mutation when client is not initialized', () => {
    mockUseUser.mockReturnValue({
      clientInitialized: false
    } as ReturnType<typeof useUser>)
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
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onSuccess = jest.fn()

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
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onError = jest.fn()

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
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onError = jest.fn()

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
    const replace = jest.fn()
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
    const replace = jest.fn()
    mockUseRouter.mockReturnValue({
      ...defaultRouter,
      query: { code: 'auth-code' },
      replace
    })

    const onSuccess = jest.fn()

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
