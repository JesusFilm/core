import { languagesContinents } from '@core/journeys/ui/useLanguagesContinentsQuery/data'

import { useSortLanguageContinents } from './useSortLanguageContinents'

describe('useSortLanguageContinents', () => {
  it('should return a record of continents and languages', () => {
    const result = useSortLanguageContinents({ languages: languagesContinents })
    expect(result).toEqual({
      Africa: ['Deutsch', 'Arabic'],
      Asia: ['Mandarin', 'Japanese'],
      Europe: ['Français'],
      Oceania: ['Bislama'],
      NorthAmerica: ['English'],
      SouthAmerica: ['Português']
    })
  })
})
