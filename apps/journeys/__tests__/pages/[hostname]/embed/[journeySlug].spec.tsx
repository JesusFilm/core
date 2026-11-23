import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import HostJourneyEmbedPage, {
  getStaticProps
} from '../../../../pages/[hostname]/embed/[journeySlug]'
import { routeContext } from '../../campaignTestHelpers'

const mockQuery = vi.fn()
vi.mock('../../../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

vi.mock('../../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {} })
}))

vi.mock('next-seo', () => ({
  NextSeo: ({ openGraph }: { openGraph?: { url?: string } }) => (
    <div data-testid="NextSeoMock" data-og-url={openGraph?.url} />
  )
}))

vi.mock('../../../../src/components/JourneyPageWrapper', () => ({
  JourneyPageWrapper: ({ children }: { children: ReactElement }) => children
}))

vi.mock('../../../../src/components/EmbeddedPreview', () => ({
  EmbeddedPreview: () => null
}))

const HOSTNAME = 'my.example.org'

const journey = {
  id: 'journeyId',
  slug: 'my-journey',
  seoTitle: 'My Journey',
  seoDescription: null,
  primaryImageBlock: null,
  blocks: [],
  themeName: 'base',
  themeMode: 'dark',
  language: { bcp47: 'en' }
}

describe('custom domain /embed/<journeySlug>', () => {
  beforeEach(() => {
    mockQuery.mockReset()
    mockQuery.mockResolvedValue({ data: { journey } })
  })

  it('renders og:url with the hostname of the route', async () => {
    const result = await getStaticProps(
      routeContext({ hostname: HOSTNAME, journeySlug: journey.slug })
    )
    if (!('props' in result)) throw new Error('expected props')

    render(<HostJourneyEmbedPage {...result.props} />)

    expect(screen.getByTestId('NextSeoMock')).toHaveAttribute(
      'data-og-url',
      `https://${HOSTNAME}/${journey.slug}`
    )
  })
})
