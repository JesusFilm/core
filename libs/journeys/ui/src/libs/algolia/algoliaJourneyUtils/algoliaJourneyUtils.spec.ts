import { defaultTemplate as coreJourney } from '../../../components/TemplateGallery/data'
import { abbreviateLanguageName } from '../../abbreviateLanguageName'
import { GetJourneys_journeys as Journey } from '../../useJourneysQuery/__generated__/GetJourneys'
import { algoliaJourneys } from '../useAlgoliaJourneys/useAlgoliaJourneys.mock'
import {
  getAlgoliaJourneyLanguage,
  getJourneyLanguage,
  isAlgoliaJourney
} from './algoliaJourneyUtils'

jest.mock('../../abbreviateLanguageName')

describe('algoliaJourneyUtils', () => {
  describe('isAlgoliaJourney', () => {
    it('should return true if the journey is an AlgoliaJourney', () => {
      expect(isAlgoliaJourney(algoliaJourneys[0])).toBe(true)
    })

    it('should return false if the journey is undefined', () => {
      expect(isAlgoliaJourney(undefined)).toBe(false)
    })

    it('should return false if the journey is not an AlgoliaJourney', () => {
      expect(isAlgoliaJourney(coreJourney)).toBe(false)
    })
  })

  describe('getAlgoliaJourneyLang', () => {
    it('should return abbreviated localName if localName is not empty', () => {
      const abbreviateLanguageNameMocked = jest.mocked(abbreviateLanguageName)
      abbreviateLanguageNameMocked.mockReturnValue('Farsi, Western')
      expect(getAlgoliaJourneyLanguage(algoliaJourneys[1])).toBe(
        'Farsi, Western'
      )
      expect(abbreviateLanguageName).toHaveBeenCalledWith('Farsi, Western')
    })

    it('should return abbreviated nativeName if localName is empty', () => {
      const abbreviateLanguageNameMocked = jest.mocked(abbreviateLanguageName)
      abbreviateLanguageNameMocked.mockReturnValue('English')
      expect(getAlgoliaJourneyLanguage(algoliaJourneys[0])).toBe('English')
      expect(abbreviateLanguageName).toHaveBeenCalledWith('English')
    })

    it('should return an empty string if abbreviateLanguageName returns undefined', () => {
      const abbreviateLanguageNameMocked = jest.mocked(abbreviateLanguageName)
      abbreviateLanguageNameMocked.mockReturnValue(undefined)
      expect(getAlgoliaJourneyLanguage(algoliaJourneys[0])).toBe('')
    })
  })

  describe('getCoreJourneyLang', () => {
    it('should return abbreviated non-primary language name if it exists', () => {
      const abbreviateLanguageNameMocked = jest.mocked(abbreviateLanguageName)
      abbreviateLanguageNameMocked.mockReturnValue('English')
      expect(getJourneyLanguage(coreJourney)).toBe('English')
      expect(abbreviateLanguageName).toHaveBeenCalledWith('English')
    })

    it('should return abbreviated primary language name if non-primary does not exist', () => {
      const mockJourney = {
        language: {
          name: [
            { value: 'Español', primary: true },
            { value: 'Spanish, Latin American', primary: false }
          ]
        }
      } as unknown as Journey
      const abbreviateLanguageNameMocked = jest.mocked(abbreviateLanguageName)
      abbreviateLanguageNameMocked.mockReturnValue('Spanish, Latin American')
      expect(getJourneyLanguage(mockJourney)).toBe('Spanish, Latin American')
      expect(abbreviateLanguageName).toHaveBeenCalledWith(
        'Spanish, Latin American'
      )
    })

    it('should return an empty string if abbreviateLanguageName returns undefined', () => {
      const abbreviateLanguageNameMocked = jest.mocked(abbreviateLanguageName)
      abbreviateLanguageNameMocked.mockReturnValue(undefined)
      expect(getJourneyLanguage(coreJourney)).toBe('')
    })
  })
})
