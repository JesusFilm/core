import { languagesContinents } from '../data'

import {
  languageWithMultipleCountries,
  languageWithNoCountries,
  sortedLanguageContinents
} from './data'
import { sortLanguageContinents } from './sortLanguageContinents'

describe('sortLanguageContinents', () => {
  it('should return a record of continents and languages', () => {
    const result = sortLanguageContinents({ languages: languagesContinents })
    expect(result).toEqual(sortedLanguageContinents)
  })

  it('should handle duplicate languages', () => {
    const result = sortLanguageContinents({
      languages: languageWithMultipleCountries
    })
    expect(result).toEqual({
      'North America': ['English'],
      Asia: ['Mandarin']
    })
  })

  it('should return an empty record if no languages are provided', () => {
    const result = sortLanguageContinents({ languages: [] })
    expect(result).toEqual({})
  })

  it('should handle languages with no associated countries or continents', () => {
    const result = sortLanguageContinents({
      languages: languageWithNoCountries
    })
    expect(result).toEqual({})
  })
})
