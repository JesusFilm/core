import { extractTemplateIdsFromJourneys } from './extractTemplateIdsFromJourneys'

describe('extractTemplateIdsFromJourneys', () => {
  it('should extract unique template IDs from a mix of journeys with and without templateIds', () => {
    const journeys = [
      { fromTemplateId: 'template1' },
      { fromTemplateId: null },
      { fromTemplateId: 'template2' },
      { fromTemplateId: undefined },
      {},
      { fromTemplateId: 'template1' },
      null,
      { fromTemplateId: 'template3' }
    ]

    const result = extractTemplateIdsFromJourneys(journeys)

    expect(result).toEqual(['template1', 'template2', 'template3'])
  })
})
