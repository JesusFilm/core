import { prismaMock } from '../../../../test/prismaMock'

import { importLanguageSlugs } from './languageSlug'

const englishWithSlug = {
  id: '529',
  slug: 'english',
  bcp47: 'en',
  iso3: 'eng',
  hasVideos: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

const tauyaWithoutSlug = {
  id: '100167',
  bcp47: null,
  iso3: 'tya',
  slug: null,
  hasVideos: false,
  createdAt: new Date(),
  updatedAt: new Date()
}

const tauyaLanguageName = {
  id: '529',
  parentLanguageId: '100167',
  value: 'Tauya',
  languageId: '529',
  primary: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('languageSlug', () => {
  describe('importLanguageSlugs', () => {
    it('should import aem language slugs and generate new slugs', async () => {
      prismaMock.language.findFirst.mockResolvedValueOnce(null)
      prismaMock.language.update.mockImplementation()
      prismaMock.language.findMany
        .mockResolvedValueOnce([tauyaWithoutSlug])
        .mockResolvedValueOnce([englishWithSlug])
      prismaMock.languageName.findMany.mockResolvedValueOnce([
        tauyaLanguageName
      ])
      await importLanguageSlugs()
      expect(prismaMock.language.update).toHaveBeenCalledWith({
        where: {
          id: '100167'
        },
        data: {
          slug: 'tauya'
        }
      })
      expect(prismaMock.language.update).toHaveBeenCalledTimes(2181)
    })

    it('should not import language slugs', async () => {
      prismaMock.language.findFirst.mockResolvedValueOnce(englishWithSlug)
      prismaMock.language.findMany.mockResolvedValueOnce([])
      prismaMock.languageName.findMany.mockResolvedValueOnce([
        tauyaLanguageName
      ])
      await importLanguageSlugs()
      expect(prismaMock.language.update).not.toHaveBeenCalled()
    })
  })
})
