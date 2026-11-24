import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  JourneyWithPublicUrl,
  getJourneyEmbedUrl,
  getJourneyPublicUrl
} from './getJourneyPublicUrl'

function journey(
  overrides: Partial<JourneyWithPublicUrl> = {}
): JourneyWithPublicUrl {
  return {
    id: 'journeyId',
    slug: 'outreach-europe',
    teamId: 'journeyTeamId',
    team: { id: 'journeyTeamId', customDomains: [] },
    journeyCollectionJourneys: [],
    ...overrides
  } as unknown as JourneyWithPublicUrl
}

describe('getJourneyPublicUrl', () => {
  it("serves a journey on its team's route-all custom domain", () => {
    expect(
      getJourneyPublicUrl(
        journey({
          team: {
            id: 'journeyTeamId',
            customDomains: [
              { name: 'journeys.example.org', routeAllTeamJourneys: true }
            ]
          }
        } as never)
      )
    ).toBe('https://journeys.example.org/outreach-europe')
  })

  it('serves a journey on the first route-all domain by name when its team has two', () => {
    expect(INCLUDE_JOURNEY_PUBLIC_URL.team.include.customDomains).toEqual({
      orderBy: { name: 'asc' }
    })
    expect(
      getJourneyPublicUrl(
        journey({
          team: {
            id: 'journeyTeamId',
            customDomains: [
              { name: 'a.example.org', routeAllTeamJourneys: true },
              { name: 'b.example.org', routeAllTeamJourneys: true }
            ]
          }
        } as never)
      )
    ).toBe('https://a.example.org/outreach-europe')
  })

  it('serves a journey on a collection domain containing it when no domain routes all', () => {
    expect(
      getJourneyPublicUrl(
        journey({
          team: {
            id: 'journeyTeamId',
            customDomains: [
              { name: 'collection.example.org', routeAllTeamJourneys: false }
            ]
          },
          journeyCollectionJourneys: [
            {
              journeyCollection: {
                customDomains: [{ name: 'collection.example.org' }]
              }
            }
          ]
        } as never)
      )
    ).toBe('https://collection.example.org/outreach-europe')
  })

  it('prefers the route-all domain over a collection domain', () => {
    expect(
      getJourneyPublicUrl(
        journey({
          team: {
            id: 'journeyTeamId',
            customDomains: [
              { name: 'collection.example.org', routeAllTeamJourneys: false },
              { name: 'journeys.example.org', routeAllTeamJourneys: true }
            ]
          },
          journeyCollectionJourneys: [
            {
              journeyCollection: {
                customDomains: [{ name: 'collection.example.org' }]
              }
            }
          ]
        } as never)
      )
    ).toBe('https://journeys.example.org/outreach-europe')
  })

  it('falls back to the root domain for a team with no domain and for a collection without one', () => {
    expect(getJourneyPublicUrl(journey())).toBe(
      'https://example.com/outreach-europe'
    )
    expect(
      getJourneyPublicUrl(
        journey({
          journeyCollectionJourneys: [
            { journeyCollection: { customDomains: [] } }
          ]
        } as never)
      )
    ).toBe('https://example.com/outreach-europe')
  })

  it('builds the root-domain embed route regardless of domains', () => {
    expect(getJourneyEmbedUrl(journey())).toBe(
      'https://example.com/embed/outreach-europe'
    )
  })
})
