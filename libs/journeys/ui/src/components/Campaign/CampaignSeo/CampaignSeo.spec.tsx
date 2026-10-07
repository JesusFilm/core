import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { campaignPublic, eurRegion } from '../testData'

import { CampaignSeo, campaignPreferredUrl } from './CampaignSeo'

vi.mock('next-seo', () => ({
  NextSeo: ({
    canonical,
    languageAlternates,
    openGraph
  }: {
    canonical: string
    languageAlternates: Array<{ hrefLang: string; href: string }>
    openGraph: { url: string }
  }): ReactElement => (
    <div
      data-testid="seo"
      data-canonical={canonical}
      data-og-url={openGraph.url}
      data-alternates={JSON.stringify(languageAlternates)}
    />
  )
}))

describe('CampaignSeo', () => {
  const rootDomain = 'your.nextstep.is'
  const attached = {
    ...campaignPublic,
    customDomainNames: ['christmas.example.org', 'other.example.org']
  }

  function seo(...props: Parameters<typeof CampaignSeo>): {
    canonical: string
    ogUrl: string
    alternates: unknown
  } {
    const { getByTestId, unmount } = render(<CampaignSeo {...props[0]} />)
    const element = getByTestId('seo')
    const result = {
      canonical: element.dataset.canonical ?? '',
      ogUrl: element.dataset.ogUrl ?? '',
      alternates: JSON.parse(element.dataset.alternates ?? '[]')
    }
    unmount()
    return result
  }

  it('canonicalises to the root-domain path when no Campaign Root is attached', () => {
    expect(seo({ campaign: campaignPublic, rootDomain }).canonical).toBe(
      'https://your.nextstep.is/campaign/christmas-2026'
    )
    expect(
      seo({ campaign: campaignPublic, region: eurRegion, rootDomain }).canonical
    ).toBe(`https://your.nextstep.is/campaign/christmas-2026/${eurRegion.slug}`)
  })

  it('canonicalises to the domain-root form when a Campaign Root is attached', () => {
    expect(seo({ campaign: attached, rootDomain }).canonical).toBe(
      'https://christmas.example.org'
    )
    expect(
      seo({ campaign: attached, region: eurRegion, rootDomain }).canonical
    ).toBe(`https://christmas.example.org/${eurRegion.slug}`)
  })

  it('uses the preferred form for the Open Graph url too', () => {
    expect(seo({ campaign: attached, rootDomain }).ogUrl).toBe(
      'https://christmas.example.org'
    )
  })

  it('emits one hreflang alternate per campaign language plus x-default, in the preferred form', () => {
    expect(seo({ campaign: attached, rootDomain }).alternates).toEqual([
      { hrefLang: 'en', href: 'https://christmas.example.org?lang=en' },
      { hrefLang: 'fr', href: 'https://christmas.example.org?lang=fr' },
      { hrefLang: 'x-default', href: 'https://christmas.example.org' }
    ])
    expect(seo({ campaign: campaignPublic, rootDomain }).alternates).toEqual([
      {
        hrefLang: 'en',
        href: 'https://your.nextstep.is/campaign/christmas-2026?lang=en'
      },
      {
        hrefLang: 'fr',
        href: 'https://your.nextstep.is/campaign/christmas-2026?lang=fr'
      },
      {
        hrefLang: 'x-default',
        href: 'https://your.nextstep.is/campaign/christmas-2026'
      }
    ])
  })

  it('names the first attached domain alphabetically as the preferred address', () => {
    expect(campaignPreferredUrl({ campaign: attached, rootDomain })).toBe(
      'https://christmas.example.org'
    )
  })
})
