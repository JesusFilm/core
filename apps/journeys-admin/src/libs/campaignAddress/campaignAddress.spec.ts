import { campaignDomainName, campaignPublicAddress } from './campaignAddress'

describe('campaignDomainName', () => {
  it("returns the campaign's Campaign Domain name", () => {
    expect(campaignDomainName([{ name: 'outreach.example.com' }])).toBe(
      'outreach.example.com'
    )
  })

  it('returns null when the campaign has no Campaign Domain', () => {
    expect(campaignDomainName([])).toBeNull()
  })

  it('returns null for an empty domain name', () => {
    expect(campaignDomainName([{ name: '' }])).toBeNull()
  })
})

describe('campaignPublicAddress', () => {
  it("returns the Campaign Domain's root when the campaign has one", () => {
    expect(
      campaignPublicAddress({
        slug: 'outreach',
        customDomains: [{ name: 'outreach.example.com' }]
      })
    ).toBe('https://outreach.example.com')
  })

  it('returns the root-domain address when the campaign has no domain', () => {
    expect(campaignPublicAddress({ slug: 'outreach', customDomains: [] })).toBe(
      'https://your.nextstep.is/campaign/outreach'
    )
  })

  it('returns the root-domain address for an empty domain name', () => {
    expect(
      campaignPublicAddress({ slug: 'outreach', customDomains: [{ name: '' }] })
    ).toBe('https://your.nextstep.is/campaign/outreach')
  })

  it('returns the region page in either form when a region is named', () => {
    expect(
      campaignPublicAddress(
        { slug: 'outreach', customDomains: [{ name: 'outreach.example.com' }] },
        'eur'
      )
    ).toBe('https://outreach.example.com/eur')
    expect(
      campaignPublicAddress({ slug: 'outreach', customDomains: [] }, 'eur')
    ).toBe('https://your.nextstep.is/campaign/outreach/eur')
  })
})
