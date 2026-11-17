import { render, screen } from '@testing-library/react'
import type { GetServerSidePropsContext } from 'next'
import type { ReactNode } from 'react'

import { getAuthTokens, redirectToLogin, toUser } from '../../src/libs/auth'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

import ConnectedAgentsPage, { getServerSideProps } from '.'

vi.mock('../../src/libs/auth', () => ({
  getAuthTokens: vi.fn(),
  redirectToLogin: vi.fn(),
  toUser: vi.fn(),
  useAuth: () => ({ user: { id: 'alice' } })
}))
vi.mock('../../src/libs/initAndAuthApp', () => ({ initAndAuthApp: vi.fn() }))
vi.mock('../../src/components/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: ReactNode }) => children
}))
vi.mock('../../src/components/ConnectedAgents', () => ({
  ConnectedAgents: ({ issuer }: { issuer: string }) => issuer
}))

const user = { id: 'alice', token: 'server-session' }
const tokens = { token: 'server-session' }
const setHeader = vi.fn()
const context = {
  res: { setHeader },
  locale: 'en',
  resolvedUrl: '/agents'
} as unknown as GetServerSidePropsContext

describe('ConnectedAgentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('AUTH_ISSUER', 'https://auth.example/issuer')
    vi.mocked(getAuthTokens).mockResolvedValue(
      tokens as unknown as NonNullable<
        Awaited<ReturnType<typeof getAuthTokens>>
      >
    )
    vi.mocked(toUser).mockReturnValue(user as ReturnType<typeof toUser>)
  })

  afterEach(() => vi.unstubAllEnvs())

  it('renders the personal connection view with the configured issuer', () => {
    render(<ConnectedAgentsPage issuer="https://auth.example" />)
    expect(screen.getByText('https://auth.example')).toBeVisible()
  })

  it('disables the route when the issuer is not configured and prohibits caching', async () => {
    vi.stubEnv('AUTH_ISSUER', '')
    expect(await getServerSideProps(context)).toEqual({ notFound: true })
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store')
    expect(setHeader).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer')
    expect(getAuthTokens).not.toHaveBeenCalled()
  })

  it('redirects unauthenticated requests before initializing the application', async () => {
    vi.mocked(getAuthTokens).mockResolvedValue(null)
    const redirect: ReturnType<typeof redirectToLogin> = {
      redirect: { destination: '/users/sign-in', permanent: false }
    }
    vi.mocked(redirectToLogin).mockReturnValue(redirect)
    expect(await getServerSideProps(context)).toEqual(redirect)
    expect(redirectToLogin).toHaveBeenCalledWith(context)
    expect(initAndAuthApp).not.toHaveBeenCalled()
  })

  it('preserves account verification and terms redirects', async () => {
    const redirect = { destination: '/users/verify-email', permanent: false }
    vi.mocked(initAndAuthApp).mockResolvedValue({
      redirect
    } as Awaited<ReturnType<typeof initAndAuthApp>>)
    expect(await getServerSideProps(context)).toEqual({ redirect })
    expect(initAndAuthApp).toHaveBeenCalledWith({
      user,
      locale: 'en',
      resolvedUrl: '/agents'
    })
  })

  it('hydrates an authenticated page with only the issuer origin and application state', async () => {
    const initialApolloState = { ROOT_QUERY: { __typename: 'Query' } }
    const state = {
      redirect: undefined,
      translations: { _nextI18Next: { initialLocale: 'en' } },
      flags: { example: true },
      apolloClient: { cache: { extract: vi.fn(() => initialApolloState) } }
    }
    vi.mocked(initAndAuthApp).mockResolvedValue(
      state as unknown as Awaited<ReturnType<typeof initAndAuthApp>>
    )
    expect(await getServerSideProps(context)).toEqual({
      props: {
        ...state.translations,
        issuer: 'https://auth.example',
        flags: state.flags,
        userSerialized: JSON.stringify(user),
        initialApolloState
      }
    })
    expect(toUser).toHaveBeenCalledWith(tokens)
  })
})
