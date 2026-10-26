import { campaignPagePaths } from './campaignPagePaths'

describe('campaignPagePaths', () => {
  it('lists the landing page and every region', () => {
    expect(
      campaignPagePaths({
        slug: 'outreach',
        regions: [{ slug: 'eur' }, { slug: 'afr' }]
      })
    ).toEqual([
      '/home/campaign/outreach',
      '/home/campaign/outreach/eur',
      '/home/campaign/outreach/afr'
    ])
  })

  it('adds the _lang page of every language tag', () => {
    expect(
      campaignPagePaths({
        slug: 'outreach',
        regions: [{ slug: 'eur' }],
        languageTags: ['en', 'fr-ca']
      })
    ).toEqual([
      '/home/campaign/outreach',
      '/home/campaign/outreach/eur',
      '/home/campaign/outreach/_lang/en',
      '/home/campaign/outreach/_lang/en/eur',
      '/home/campaign/outreach/_lang/fr-ca',
      '/home/campaign/outreach/_lang/fr-ca/eur'
    ])
  })

  it('repeats every page in the form of each Custom Domain', () => {
    expect(
      campaignPagePaths({
        slug: 'outreach',
        regions: [{ slug: 'eur' }],
        hostnames: ['outreach.example.org'],
        languageTags: ['en', 'es']
      })
    ).toEqual([
      '/home/campaign/outreach',
      '/home/campaign/outreach/eur',
      '/home/campaign/outreach/_lang/en',
      '/home/campaign/outreach/_lang/en/eur',
      '/home/campaign/outreach/_lang/es',
      '/home/campaign/outreach/_lang/es/eur',
      '/outreach.example.org',
      '/outreach.example.org/eur',
      '/outreach.example.org/_lang/en',
      '/outreach.example.org/_lang/en/eur',
      '/outreach.example.org/_lang/es',
      '/outreach.example.org/_lang/es/eur'
    ])
  })
})
