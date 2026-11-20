import type { GetServerSidePropsContext } from 'next'

import { createApolloClient } from '../../src/libs/apolloClient'
import { getAuthTokens, toUser } from '../../src/libs/auth/getAuthTokens'

import { getServerSideProps } from '../../pages/journeys/[journeyId]/preview'

vi.mock('../../src/components/PrivateJourneyPreview', () => ({
  PrivateJourneyPreview: () => null
}))
vi.mock('../../src/libs/apolloClient', () => ({
  createApolloClient: vi.fn()
}))
vi.mock('../../src/libs/auth/getAuthTokens', () => ({
  getAuthTokens: vi.fn(),
  toUser: vi.fn(),
  redirectToLogin: () => ({
    redirect: { destination: '/users/sign-in', permanent: false }
  })
}))
vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: async () => ({})
}))

describe('private preview page data', () => {
  const query = vi.fn()
  const header = vi.fn()
  const context = {
    params: { journeyId: 'private-id' },
    query: {},
    res: { setHeader: header }
  } as unknown as GetServerSidePropsContext

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthTokens).mockResolvedValue({
      token: 'session-token'
    } as Awaited<ReturnType<typeof getAuthTokens>>)
    vi.mocked(toUser).mockReturnValue({
      id: 'alice',
      token: 'session-token',
      isAnonymous: false
    } as ReturnType<typeof toUser>)
    vi.mocked(createApolloClient).mockReturnValue({
      query
    } as unknown as ReturnType<typeof createApolloClient>)
    query.mockResolvedValue({
      data: {
        journeyPreview: {
          id: 'private-id',
          title: 'protected-content-sentinel'
        }
      }
    })
  })

  it('serializes no journey data or Apollo cache even after an authorized warm read', async () => {
    const result = await getServerSideProps(context)
    expect(JSON.stringify(result)).not.toContain('protected-content-sentinel')
    expect(JSON.stringify(result)).not.toContain('initialApolloState')
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: 'no-cache' })
    )
    expect(header).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store, max-age=0'
    )
    query.mockRejectedValueOnce(new Error('current access removed'))
    expect(await getServerSideProps(context)).toEqual({ notFound: true })
  })

  it('redirects signed-out and guest identities before reading private data', async () => {
    vi.mocked(getAuthTokens).mockResolvedValueOnce(null)
    expect(await getServerSideProps(context)).toHaveProperty('redirect')
    vi.mocked(toUser).mockReturnValueOnce({ isAnonymous: true } as ReturnType<
      typeof toUser
    >)
    expect(await getServerSideProps(context)).toHaveProperty('redirect')
    expect(query).not.toHaveBeenCalled()
  })

  it('rejects malformed routes and revisions without data reads', async () => {
    expect(
      await getServerSideProps({ ...context, query: { revision: '-1' } })
    ).toEqual({ notFound: true })
    expect(await getServerSideProps({ ...context, params: {} })).toEqual({
      notFound: true
    })
    expect(query).not.toHaveBeenCalled()
  })
})
