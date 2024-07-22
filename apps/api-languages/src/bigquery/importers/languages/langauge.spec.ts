import { prismaMock } from '../../../../test/prismaMock'
import { getExistingPrismaLanguageIds } from './languages'

import { Language } from '.prisma/api-languages-client'

describe('importers/languages/languages', () => {
  describe('getExistingPrismaLanguageIds', () => {
    it('should return existing language ids', async () => {
      prismaMock.language.findMany.mockResolvedValue([
        { id: '1' } as unknown as Language
      ])
      expect(await getExistingPrismaLanguageIds()).toEqual(['1'])
    })
  })
})
