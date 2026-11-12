import { JourneyStatus } from '../../__generated__/globalTypes'
import { getStaticProps as hosted } from '../../pages/[hostname]/[journeySlug]'
import { getStaticProps as hostedStep } from '../../pages/[hostname]/[journeySlug]/[stepSlug]'
import { getStaticProps as hostedLanguage } from '../../pages/[hostname]/_lang/[lang]/[journeySlug]'
import { getStaticProps as hostedEmbed } from '../../pages/[hostname]/embed/[journeySlug]'
import { getStaticProps as home } from '../../pages/home/[journeySlug]'
import { getStaticProps as homeStep } from '../../pages/home/[journeySlug]/[stepSlug]'
import { getStaticProps as homeEmbed } from '../../pages/home/embed/[journeySlug]'

import { nothingPublished, routeContext } from './campaignTestHelpers'

const query = vi.fn()
vi.mock('../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query })
}))
vi.mock('../../src/libs/getCampaignPublic', () => ({
  apolloCampaignReader: () => nothingPublished
}))
vi.mock('../../src/libs/getFlags', () => ({
  getFlags: () => Promise.resolve({})
}))
vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: () => Promise.resolve({ _nextI18Next: {} })
}))

describe('public journey page data', () => {
  it.each([
    home,
    homeStep,
    homeEmbed,
    hosted,
    hostedStep,
    hostedEmbed,
    hostedLanguage
  ])(
    'does not serialize draft content into public HTML or page data',
    async (getProps) => {
      // Even a stale or misconfigured upstream must not populate the public ISR cache.
      query.mockResolvedValue({
        data: {
          journey: {
            status: JourneyStatus.draft,
            title: 'PRIVATE PAGE SENTINEL',
            slug: 'private',
            language: { bcp47: 'en' },
            website: true,
            blocks: [{ __typename: 'StepBlock', id: 'step', slug: 'step' }]
          }
        }
      })
      const result = await getProps(
        routeContext({
          hostname: 'example.org',
          journeySlug: 'private',
          stepSlug: 'step',
          lang: 'en'
        })
      )
      expect(result).toHaveProperty('notFound', true)
      expect(JSON.stringify(result)).not.toContain('PRIVATE PAGE SENTINEL')
    }
  )
})
