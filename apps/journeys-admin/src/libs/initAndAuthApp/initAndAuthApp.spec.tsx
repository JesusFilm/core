import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { LDClient } from 'launchdarkly-node-server-sdk'
import { User as AuthUser } from 'next-firebase-auth'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { cache } from '../apolloClient/cache'
import { checkConditionalRedirect } from '../checkConditionalRedirect'

import { initAndAuthApp } from './initAndAuthApp'

jest.mock('next-i18next/serverSideTranslations')
jest.mock('@core/shared/ui/getLaunchDarklyClient')
jest.mock('../apolloClient')
jest.mock('../checkConditionalRedirect')

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

describe('initAndAuthApp', () => {
  const mockAuthUser = {
    id: '1',
    displayName: 'test',
    email: 'test@test.com',
    getIdToken: jest.fn().mockResolvedValue('token')
  } as unknown as AuthUser

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

    // mock getLaunchDarklyClient
    getLaunchDarklyClientMock.mockResolvedValueOnce({
      allFlagsState: async () => ({
        toJSON: () => ({ termsAndConditions: true })
      })
    } as unknown as LDClient)

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

  it('should return with apolloClient, flags, redirect, and translations', async () => {
    const result = await initAndAuthApp({
      AuthUser: mockAuthUser,
      locale: 'en'
    })

    expect(result).toEqual({
      apolloClient: expect.any(ApolloClient),
      flags: { termsAndConditions: true },
      redirect: {
        destination: '/users/terms-and-conditions',
        permanent: false
      },
      translations: mockSSRConfig
    })
  })
})
