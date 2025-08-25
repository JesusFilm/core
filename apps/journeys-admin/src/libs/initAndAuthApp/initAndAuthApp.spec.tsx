import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { getApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { LDClient } from 'launchdarkly-node-server-sdk'
import { User } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

import { ACCEPT_ALL_INVITES, initAndAuthApp } from './initAndAuthApp'

jest.mock('next-i18next/serverSideTranslations')
jest.mock('@core/shared/ui/getLaunchDarklyClient')
jest.mock('../apolloClient')
jest.mock('../checkConditionalRedirect')
jest.mock('firebase/app')
jest.mock('firebase/auth')

const serverSideTranslationsMock =
  serverSideTranslations as jest.MockedFunction<typeof serverSideTranslations>
const getLaunchDarklyClientMock = getLaunchDarklyClient as jest.MockedFunction<
  typeof getLaunchDarklyClient
>
const createApolloClientMock = createApolloClient as jest.MockedFunction<
  typeof createApolloClient
>
const checkConditionalRedirectMock =
  checkConditionalRedirect as jest.MockedFunction<
    typeof checkConditionalRedirect
  >
const getAppMock = getApp as jest.MockedFunction<typeof getApp>
const getAuthMock = getAuth as jest.MockedFunction<typeof getAuth>
const signInAnonymouslyMock = signInAnonymously as jest.MockedFunction<
  typeof signInAnonymously
>

describe('initAndAuthApp', () => {
  const mockUser = {
    id: '1',
    displayName: 'test',
    email: 'test@test.com',
    getIdToken: jest.fn().mockResolvedValue('token')
  } as unknown as User

  const mockSSRConfig: SSRConfig = {
    _nextI18Next: {
      initialI18nStore: undefined,
      initialLocale: 'en',
      ns: ['apps-journeys-admin', 'libs-journeys-ui'],
      userConfig: i18nConfig
    }
  }
  let apolloClient

  beforeEach(() => {
    // mock serverSideTranslation
    serverSideTranslationsMock.mockResolvedValue(mockSSRConfig)

    // mock getLaunchDarklyClient
    getLaunchDarklyClientMock.mockResolvedValueOnce({
      allFlagsState: async () => ({
        toJSON: () => ({ termsAndConditions: true })
      })
    } as unknown as LDClient)

    // mock ApolloClient
    apolloClient = { mutate: jest.fn() }
    createApolloClientMock.mockReturnValueOnce(
      apolloClient as ApolloClient<NormalizedCacheObject>
    )

    // mock checkConditionalRedirect
    checkConditionalRedirectMock.mockResolvedValueOnce({
      destination: '/users/terms-and-conditions',
      permanent: false
    })

    // mock Firebase functions
    getAppMock.mockReturnValue({} as any)
    getAuthMock.mockReturnValue({} as any)
    signInAnonymouslyMock.mockResolvedValue({} as any)
  })

  it('should return with apolloClient, flags, redirect, and translations when auth user', async () => {
    const result = await initAndAuthApp({
      user: mockUser,
      locale: 'en',
      resolvedUrl: '/templates'
    })

    expect(apolloClient.mutate).toHaveBeenCalledWith({
      mutation: ACCEPT_ALL_INVITES
    })

    expect(result).toEqual({
      apolloClient,
      flags: { termsAndConditions: true },
      redirect: {
        destination: '/users/terms-and-conditions',
        permanent: false
      },
      translations: mockSSRConfig
    })
  })

  it('should return with apolloClient, flags, redirect, and translations when anonymous user', async () => {
    const result = await initAndAuthApp({
      user: {
        id: null
      } as unknown as User,
      locale: 'en',
      resolvedUrl: '/templates'
    })

    expect(apolloClient.mutate).not.toHaveBeenCalled()

    expect(result).toEqual({
      apolloClient,
      flags: { termsAndConditions: true },
      redirect: undefined,
      translations: mockSSRConfig
    })
  })

  it('should call checkConditionalRedirect with default teamName', async () => {
    await initAndAuthApp({
      user: {
        id: null
      } as unknown as User,
      locale: 'en',
      resolvedUrl: '/templates'
    })
    expect(checkConditionalRedirectMock).toHaveBeenCalledWith({
      apolloClient: {
        mutate: expect.any(Function)
      },
      resolvedUrl: '/templates',
      teamName: 'My Team'
    })
  })

  it('should call checkConditionalRedirect with default teamName if no translation', async () => {
    serverSideTranslationsMock.mockResolvedValueOnce({
      _nextI18Next: {
        initialI18nStore: {
          en: {
            'apps-journeys-admin': {}
          }
        },
        initialLocale: 'en',
        ns: ['apps-journeys-admin', 'libs-journeys-ui'],
        userConfig: i18nConfig
      }
    })

    await initAndAuthApp({
      user: mockUser,
      locale: 'en',
      resolvedUrl: '/templates'
    })

    expect(checkConditionalRedirectMock).toHaveBeenCalledWith({
      apolloClient: {
        mutate: expect.any(Function)
      },
      resolvedUrl: '/templates',
      teamName: 'My Team'
    })
  })

  it('should call checkConditionalRedirect with default teamName if no displayName', async () => {
    serverSideTranslationsMock.mockResolvedValueOnce({
      _nextI18Next: {
        initialI18nStore: {
          en: {
            'apps-journeys-admin': {}
          }
        },
        initialLocale: 'en',
        ns: ['apps-journeys-admin', 'libs-journeys-ui'],
        userConfig: i18nConfig
      }
    })

    await initAndAuthApp({
      user: { ...mockUser, displayName: null },
      locale: 'en',
      resolvedUrl: '/templates'
    })

    expect(checkConditionalRedirectMock).toHaveBeenCalledWith({
      apolloClient: {
        mutate: expect.any(Function)
      },
      resolvedUrl: '/templates',
      teamName: 'My Team'
    })
  })

  it('should call checkConditionalRedirect with teamName if translation', async () => {
    serverSideTranslationsMock.mockResolvedValueOnce({
      _nextI18Next: {
        initialI18nStore: {
          en: {
            'apps-journeys-admin': {
              "{{ name }}'s Team": "{{ name }}'s Team"
            }
          }
        },
        initialLocale: 'en',
        ns: ['apps-journeys-admin', 'libs-journeys-ui'],
        userConfig: i18nConfig
      }
    })

    await initAndAuthApp({
      user: mockUser,
      locale: 'en',
      resolvedUrl: '/templates'
    })

    expect(checkConditionalRedirectMock).toHaveBeenCalledWith({
      apolloClient: {
        mutate: expect.any(Function)
      },
      resolvedUrl: '/templates',
      teamName: "test's Team"
    })
  })

  // it('should call signInAnonymously when makeAccountOnAnonymous is true and user is undefined', async () => {
  //   await initAndAuthApp({
  //     user: undefined,
  //     locale: 'en',
  //     resolvedUrl: '/templates',
  //     makeAccountOnAnonymous: true
  //   })

  //   expect(signInAnonymouslyMock).toHaveBeenCalledWith({})
  // })
})
