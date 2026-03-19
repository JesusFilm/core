import { getJourneyIdFromRedirect } from './getJourneyIdFromRedirect'

describe('getJourneyIdFromRedirect', () => {
  it('returns undefined when redirectQuery is undefined', () => {
    expect(getJourneyIdFromRedirect(undefined)).toBeUndefined()
  })

  it('extracts journey id from path-only redirect', () => {
    expect(
      getJourneyIdFromRedirect('/templates/journey-123-id/customize')
    ).toBe('journey-123-id')
  })

  it('extracts journey id from full URL redirect', () => {
    expect(
      getJourneyIdFromRedirect(
        'https://admin.nextstep.is/templates/abc-uuid-456/customize'
      )
    ).toBe('abc-uuid-456')
  })

  it('extracts journey id when redirect is encoded', () => {
    const encoded = encodeURIComponent(
      'https://admin.nextstep.is/templates/encoded-id-789/customize'
    )
    expect(getJourneyIdFromRedirect(encoded)).toBe('encoded-id-789')
  })

  it('returns undefined when redirect does not contain /templates/', () => {
    expect(getJourneyIdFromRedirect('/journeys/other-id')).toBeUndefined()
    expect(getJourneyIdFromRedirect('https://example.com/')).toBeUndefined()
  })

  it('stops at query string or slash when extracting id', () => {
    expect(
      getJourneyIdFromRedirect('/templates/slug-id/customize?newAccount=true')
    ).toBe('slug-id')
  })
})
