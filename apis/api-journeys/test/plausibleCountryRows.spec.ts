import { plausibleCountryRowsBySite } from './plausibleCountryRows'

describe('plausibleCountryRowsBySite', () => {
  const respond = plausibleCountryRowsBySite({ journeyId: [['GB', 3]] })

  it.each([
    undefined,
    null,
    'api-journeys-journey-journeyId',
    42,
    {},
    { site_id: null },
    { site_id: 42 }
  ])('returns no country rows for invalid params %j', async (params) => {
    await expect(respond('/breakdown', { params })).resolves.toEqual({
      data: { results: [] }
    })
  })

  it('returns no country rows without request config', async () => {
    await expect(respond('/breakdown')).resolves.toEqual({
      data: { results: [] }
    })
  })
})
