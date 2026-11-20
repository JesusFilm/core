import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import Box from '@mui/material/Box'
import { render, screen } from '@testing-library/react'
import type { ComponentProps, ReactNode } from 'react'

import App from './_app'

const { navigation, team } = vi.hoisted(() => ({
  navigation: { asPath: '/' },
  team: vi.fn()
}))
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.empty()
})
vi.mock('next/router', () => ({ useRouter: () => navigation }))
vi.mock('../src/libs/apolloClient', () => ({ useApollo: () => client }))
vi.mock('../src/libs/auth/firebase', () => ({ getFirebaseAuth: vi.fn() }))
vi.mock('../src/libs/auth', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}))
vi.mock('@core/journeys/ui/TeamProvider', () => ({
  TeamProvider: ({ children }: { children: ReactNode }) => {
    team()
    return <>{children}</>
  }
}))
vi.mock('@next/third-parties/google', () => ({
  GoogleTagManager: () => <Box data-testid="gtm" />
}))
vi.mock('next/script', () => ({ default: () => <Box data-testid="rum" /> }))
vi.mock('next-seo', () => ({ DefaultSeo: () => null }))
vi.mock('next-i18next/pages', () => ({
  appWithTranslation: (component: unknown) => component,
  useTranslation: () => ({ t: (value: string) => value })
}))

describe('private preview application effects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_GTM_ID', 'controlled-gtm')
    vi.stubEnv('NEXT_PUBLIC_DATADOG_APPLICATION_ID', 'controlled-rum')
    vi.stubEnv('NEXT_PUBLIC_DATADOG_CLIENT_TOKEN', 'controlled-rum-token')
  })

  afterEach(() => vi.unstubAllEnvs())

  function open(path: string, privatePreview?: boolean): void {
    navigation.asPath = path
    const props = {
      Component: () => <Box>Page content</Box>,
      pageProps: { privatePreview },
      router: navigation
    } as unknown as ComponentProps<typeof App>
    render(<App {...props} />)
  }

  it.each([
    ['/404', true],
    ['/journeys/saved/preview', undefined],
    ['/journeys/saved/preview?revision=12', undefined]
  ] as const)(
    'suppresses analytics and team effects for private page %s',
    (path, privatePreview) => {
      open(path, privatePreview)
      expect(screen.getByText('Page content')).toBeInTheDocument()
      expect(screen.queryByTestId('gtm')).not.toBeInTheDocument()
      expect(screen.queryByTestId('rum')).not.toBeInTheDocument()
      expect(team).not.toHaveBeenCalled()
    }
  )

  it('preserves normal Admin analytics and team initialization', () => {
    open('/journeys/saved')
    expect(screen.getByTestId('gtm')).toBeInTheDocument()
    expect(screen.getByTestId('rum')).toBeInTheDocument()
    expect(team).toHaveBeenCalledOnce()
  })
})
