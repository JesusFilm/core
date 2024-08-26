import {
  importAudioPreviews,
  importCountries,
  importCountryLanguages,
  importCountryNames,
  importLanguageNames,
  importLanguageSlugs,
  importLanguages
} from '../importers'

import { service } from './service'

jest.mock('../importers', () => ({
  importAudioPreviews: jest.fn(),
  importCountries: jest.fn(),
  importCountryLanguages: jest.fn(),
  importCountryNames: jest.fn(),
  importLanguageNames: jest.fn(),
  importLanguageSlugs: jest.fn(),
  importLanguages: jest.fn()
}))

describe('bigQuery/service', () => {
  describe('service', () => {
    it('should call importers', async () => {
      await service()
      expect(importAudioPreviews).toHaveBeenCalled()
      expect(importCountries).toHaveBeenCalled()
      expect(importCountryLanguages).toHaveBeenCalled()
      expect(importCountryNames).toHaveBeenCalled()
      expect(importLanguageNames).toHaveBeenCalled()
      expect(importLanguageSlugs).toHaveBeenCalled()
      expect(importLanguages).toHaveBeenCalled()
    })
  })
})
