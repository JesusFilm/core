import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { User } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { cache } from '../apolloClient/cache'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

import { initAndAuthApp } from './initAndAuthApp'

jest.mock('next-i18next/serverSideTranslations')
jest.mock('../apolloClient')
jest.mock('../checkConditionalRedirect')

const serverSideTranslationsMock =
  serverSideTranslations as jest.MockedFunction<typeof serverSideTranslations>

const createApolloClientMock = createApolloClient as jest.MockedFunction<
  typeof createApolloClient
>
const checkConditionalRedirectMock =
  checkConditionalRedirect as jest.MockedFunction<
    typeof checkConditionalRedirect
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

  beforeEach(() => {
    // mock serverSideTranslation
    serverSideTranslationsMock.mockResolvedValueOnce(mockSSRConfig)

    // mock ApolloClient
    createApolloClientMock.mockReturnValueOnce(
      new ApolloClient<NormalizedCacheObject>({
        uri: '',
        cache: cache(),
        name: 'journeys-admin'
      })
    )

    // mock checkConditionalRedirect
    checkConditionalRedirectMock.mockResolvedValueOnce({
      destination: '/users/terms-and-conditions',
      permanent: false
    })
  })

  it('should return with apolloClient, redirect, and translations when auth user', async () => {
    const result = await initAndAuthApp({
      user: mockUser,
      locale: 'en',
      resolvedUrl: '/templates'
    })

    expect(result).toEqual({
      apolloClient: expect.any(ApolloClient),
      redirect: {
        destination: '/users/terms-and-conditions',
        permanent: false
      },
      translations: mockSSRConfig
    })
  })

  it('should return with apolloClient, redirect, and translations when anonymous user', async () => {
    const result = await initAndAuthApp({
      user: {
        id: null
      } as unknown as User,
      locale: 'en',
      resolvedUrl: '/templates'
    })

    expect(result).toEqual({
      apolloClient: expect.any(ApolloClient),
      redirect: undefined,
      translations: mockSSRConfig
    })
  })
})
