import { algoliaJourneys } from './data'
import { transformItems, useJourneyHits } from './useJourneyHits'

describe('useJourneyHits', () => {
  it('should have added missing attributes', () => {
    if (transformItems) {
      const transformedItems = transformItems(algoliaJourneys, {})
      expect(transformedItems.every((item) => item.id === item.objectID)).toBe(
        true
      )
      expect(
        transformedItems.every((item) => item.createdAt === item.date)
      ).toBe(true)
      expect(
        transformedItems.every((item) => item.primaryImageBlock === item.image)
      ).toBe(true)
    }
  })
})
