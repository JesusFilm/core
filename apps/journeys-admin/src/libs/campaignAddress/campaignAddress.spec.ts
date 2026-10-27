import { campaignDomainName } from './campaignAddress'

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
