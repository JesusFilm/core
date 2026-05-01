import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'

import { User } from '../../src/libs/auth/authContext'
import {
  getAuthTokens,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

import { getServerSideProps } from './index'

function noop(): void {
  // intentional no-op for console.warn spy
}

jest.mock('../../src/libs/auth/getAuthTokens')
jest.mock('../../src/libs/initAndAuthApp')

const mockGetAuthTokens = getAuthTokens as jest.MockedFunction<
  typeof getAuthTokens
>
const mockToUser = toUser as jest.MockedFunction<typeof toUser>
const mockInitAndAuthApp = initAndAuthApp as jest.MockedFunction<
  typeof initAndAuthApp
>

describe('templates/index getServerSideProps', () => {
  const ctx = {
    locale: 'en',
    resolvedUrl: '/templates',
    req: { cookies: {} },
    res: {},
    query: {},
    params: {}
  } as unknown as GetServerSidePropsContext

  const mockUser: User = {
    id: 'user-1',
    uid: 'user-1',
    email: 'user@example.com',
    displayName: 'Test User',
    photoURL: null,
    phoneNumber: null,
    emailVerified: true,
    token: 'jwt-token',
    isAnonymous: false,
    providerId: 'google.com'
  }

  const mockTokens = {
    token: 'jwt-token',
    decodedToken: {}
  } as Parameters<typeof toUser>[0]

  function makeApolloClient(
    languageIds: string[] = ['529']
  ): ApolloClient<NormalizedCacheObject> {
    return {
      query: jest.fn().mockResolvedValue({
        data: { journeyTemplateLanguageIds: languageIds }
      }),
      cache: { extract: jest.fn().mockReturnValue({}) }
    } as unknown as ApolloClient<NormalizedCacheObject>
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('serializes the user and forwards locale/resolvedUrl when auth tokens are present', async () => {
    const apolloClient = makeApolloClient()
    mockGetAuthTokens.mockResolvedValueOnce(mockTokens)
    mockToUser.mockReturnValueOnce(mockUser)
    mockInitAndAuthApp.mockResolvedValueOnce({
      apolloClient,
      flags: { someFlag: true },
      redirect: undefined,
      translations: {} as never
    })

    const result = await getServerSideProps(ctx)

    expect(mockInitAndAuthApp).toHaveBeenCalledWith(
      expect.objectContaining({
        user: mockUser,
        locale: 'en',
        resolvedUrl: '/templates',
        allowGuest: true
      })
    )
    expect(apolloClient.query).toHaveBeenCalledTimes(4)
    if (!('props' in result)) throw new Error('expected props in result')
    expect(result.props?.userSerialized).toBe(JSON.stringify(mockUser))
    expect(result.props?.flags).toEqual({ someFlag: true })
    expect(result.props?.initialApolloState).toEqual({})
  })

  it('returns null user without redirect when no auth tokens are present', async () => {
    mockGetAuthTokens.mockResolvedValueOnce(null)
    mockInitAndAuthApp.mockResolvedValueOnce({
      apolloClient: makeApolloClient(),
      flags: {},
      redirect: undefined,
      translations: {} as never
    })

    const result = await getServerSideProps(ctx)

    expect(mockToUser).not.toHaveBeenCalled()
    expect(mockInitAndAuthApp).toHaveBeenCalledWith(
      expect.objectContaining({ user: null, allowGuest: true })
    )
    expect('redirect' in result).toBe(false)
    if (!('props' in result)) throw new Error('expected props in result')
    expect(result.props?.userSerialized).toBeNull()
  })

  it('falls back to an empty languages query when journeyTemplateLanguageIds is empty', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(noop)
    const apolloClient = makeApolloClient([])
    mockGetAuthTokens.mockResolvedValueOnce(null)
    mockInitAndAuthApp.mockResolvedValueOnce({
      apolloClient,
      flags: {},
      redirect: undefined,
      translations: {} as never
    })

    const result = await getServerSideProps(ctx)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect('props' in result).toBe(true)
    const languagesCall = (apolloClient.query as jest.Mock).mock.calls.find(
      ([options]) => options?.variables?.where?.ids != null
    )
    expect(languagesCall?.[0].variables.where.ids).toEqual([])
    warnSpy.mockRestore()
  })

  it('forwards redirect from initAndAuthApp without running gallery queries', async () => {
    const apolloClient = makeApolloClient()
    mockGetAuthTokens.mockResolvedValueOnce(mockTokens)
    mockToUser.mockReturnValueOnce(mockUser)
    mockInitAndAuthApp.mockResolvedValueOnce({
      apolloClient,
      flags: {},
      redirect: {
        destination: '/users/verify?redirect=/templates',
        permanent: false
      },
      translations: {} as never
    })

    const result = await getServerSideProps(ctx)

    expect(result).toEqual({
      redirect: {
        destination: '/users/verify?redirect=/templates',
        permanent: false
      }
    })
    expect(apolloClient.query).not.toHaveBeenCalled()
  })
})
