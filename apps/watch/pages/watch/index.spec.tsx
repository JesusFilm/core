import type { GetStaticPropsResult } from 'next'

import type { HomePageProps } from './index'

jest.mock('react-instantsearch', () => {
  const actual = jest.requireActual('react-instantsearch')
  return {
    ...actual,
    getServerState: jest.fn()
  }
})

const mockExtract = jest.fn().mockReturnValue('apollo-state')

jest.mock('../../src/libs/apolloClient', () => ({
  createApolloClient: jest.fn(() => ({
    cache: {
      extract: mockExtract
    }
  })),
  useApolloClient: jest.fn(() => ({
    cache: {
      extract: jest.fn()
    }
  }))
}))

jest.mock('../../src/libs/getFlags', () => ({
  getFlags: jest.fn(async () => ({ feature: true }))
}))

jest.mock('../../src/libs/getLanguageIdFromLocale', () => ({
  getLanguageIdFromLocale: jest.fn(() => 'derived-language-id')
}))

jest.mock('../../src/libs/algolia/instantSearchRouter/instantSearchRouter', () => ({
  createInstantSearchRouter: jest.fn(() => ({}))
}))

jest.mock('@core/journeys/ui/algolia/InstantSearchProvider', () => ({
  useInstantSearchClient: jest.fn(() => ({}))
}))

jest.mock('../../src/components/WatchHomePage', () => ({
  WatchHomePage: () => null
}))

jest.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: jest.fn(async () => ({
    _nextI18Next: {
      initialI18nStore: {}
    }
  }))
}))

let getStaticProps: typeof import('./index').getStaticProps

describe('watch index page', () => {
  const { getServerState } = jest.requireMock('react-instantsearch') as {
    getServerState: jest.Mock
  }
  const { createApolloClient } = jest.requireMock('../../src/libs/apolloClient') as {
    createApolloClient: jest.Mock
  }
  const { getFlags } = jest.requireMock('../../src/libs/getFlags') as {
    getFlags: jest.Mock
  }
  const { getLanguageIdFromLocale } = jest.requireMock(
    '../../src/libs/getLanguageIdFromLocale'
  ) as {
    getLanguageIdFromLocale: jest.Mock
  }
  const { serverSideTranslations } = jest.requireMock(
    'next-i18next/serverSideTranslations'
  ) as {
    serverSideTranslations: jest.Mock
  }

  beforeAll(async () => {
    ;({ getStaticProps } = await import('./index'))
  })

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_ALGOLIA_INDEX = 'watch-index'
  })

  it('returns static props for the home page', async () => {
    getServerState.mockResolvedValueOnce('server-state')

    const result = (await getStaticProps({
      locale: 'es'
    })) as GetStaticPropsResult<HomePageProps>

    expect(getServerState).toHaveBeenCalled()
    expect(createApolloClient).toHaveBeenCalled()
    expect(getFlags).toHaveBeenCalled()
    expect(getLanguageIdFromLocale).toHaveBeenCalledWith('es')
    expect(serverSideTranslations).toHaveBeenCalledWith(
      'es',
      ['apps-watch'],
      expect.anything()
    )

    expect(result).toEqual({
      revalidate: 3600,
      props: expect.objectContaining({
        flags: { feature: true },
        serverState: 'server-state',
        localLanguageId: 'derived-language-id',
        initialApolloState: 'apollo-state'
      })
    })
  })

  it('defaults to english locale when none is provided', async () => {
    getLanguageIdFromLocale.mockReturnValueOnce('english-id')

    const result = (await getStaticProps({})) as GetStaticPropsResult<HomePageProps>

    expect(getLanguageIdFromLocale).toHaveBeenCalledWith('en')
    expect(result).toEqual({
      revalidate: 3600,
      props: expect.objectContaining({
        localLanguageId: 'english-id'
      })
    })
  })
})

