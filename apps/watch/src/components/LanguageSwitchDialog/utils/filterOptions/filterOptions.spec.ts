import { Language } from '../../../../libs/useLanguages'

import { filterOptions } from '.'

describe('filterOptions', () => {
  const mockLanguages: Language[] = [
    {
      id: '529',
      slug: 'english',
      displayName: 'English',
      nativeName: {
        id: 'native-529',
        primary: true,
        value: 'English'
      }
    },
    {
      id: '496',
      slug: 'spanish',
      displayName: 'Spanish',
      nativeName: {
        id: 'native-496',
        primary: true,
        value: 'Español'
      }
    },
    {
      id: '497',
      slug: 'french',
      displayName: 'French',
      nativeName: {
        id: 'native-497',
        primary: true,
        value: 'Français'
      }
    },
    {
      id: '498',
      slug: 'german',
      displayName: 'German',
      nativeName: {
        id: 'native-498',
        primary: true,
        value: 'Deutsch'
      }
    },
    {
      id: '499',
      slug: 'chinese',
      displayName: 'Chinese',
      nativeName: {
        id: 'native-499',
        primary: true,
        value: '中文'
      }
    }
  ]

  const createFilterState = (inputValue: string) => ({
    inputValue,
    getOptionLabel: (option: Language) => option.displayName
  })

  describe('filter function', () => {
    it('should filter languages by displayName', () => {
      const result = filterOptions(mockLanguages, createFilterState('English'))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('529')
    })

    it('should filter languages by nativeName.value', () => {
      const result = filterOptions(mockLanguages, createFilterState('Español'))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('496')
    })

    it('should filter languages by id', () => {
      const result = filterOptions(mockLanguages, createFilterState('529'))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('529')
    })

    it('should filter languages by partial displayName', () => {
      const result = filterOptions(mockLanguages, createFilterState('Eng'))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('529')
    })

    it('should filter languages by partial nativeName.value', () => {
      const result = filterOptions(mockLanguages, createFilterState('Esp'))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('496')
    })

    it('should filter languages by partial id', () => {
      const result = filterOptions(mockLanguages, createFilterState('49'))

      expect(result).toHaveLength(4) // 496, 497, 498, 499
    })

    it('should return all languages when search term is empty', () => {
      const result = filterOptions(mockLanguages, createFilterState(''))

      expect(result).toHaveLength(5)
    })

    it('should return empty languages when search term is whitespace only', () => {
      const result = filterOptions(mockLanguages, createFilterState('   '))

      expect(result).toHaveLength(0)
    })

    it('should be case insensitive', () => {
      const result = filterOptions(mockLanguages, createFilterState('english'))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('529')
    })

    it('should handle special characters in nativeName', () => {
      const result = filterOptions(mockLanguages, createFilterState('中文'))

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('499')
    })

    it('should return empty array when no matches found', () => {
      const result = filterOptions(
        mockLanguages,
        createFilterState('nonexistent')
      )

      expect(result).toHaveLength(0)
    })

    it('should handle language without nativeName', () => {
      const languageWithoutNativeName: Language = {
        id: '500',
        slug: 'test',
        displayName: 'Test Language'
      }

      const languagesWithTest = [...mockLanguages, languageWithoutNativeName]
      const result = filterOptions(
        languagesWithTest,
        createFilterState('Test Language')
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('500')
    })

    it('should handle language with null nativeName', () => {
      const languageWithNullNativeName: Language = {
        id: '501',
        slug: 'test',
        displayName: 'Test Language',
        nativeName: null as any
      }

      const languagesWithTest = [...mockLanguages, languageWithNullNativeName]
      const result = filterOptions(
        languagesWithTest,
        createFilterState('Test Language')
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('501')
    })

    it('should handle language with undefined nativeName', () => {
      const languageWithUndefinedNativeName: Language = {
        id: '502',
        slug: 'test',
        displayName: 'Test Language',
        nativeName: undefined
      }

      const languagesWithTest = [
        ...mockLanguages,
        languageWithUndefinedNativeName
      ]
      const result = filterOptions(
        languagesWithTest,
        createFilterState('Test Language')
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('502')
    })

    it('should handle language with empty nativeName.value', () => {
      const languageWithEmptyNativeName: Language = {
        id: '503',
        slug: 'test',
        displayName: 'Test Language',
        nativeName: {
          id: 'native-503',
          primary: true,
          value: ''
        }
      }

      const languagesWithTest = [...mockLanguages, languageWithEmptyNativeName]
      const result = filterOptions(
        languagesWithTest,
        createFilterState('Test Language')
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('503')
    })

    it('should handle language with empty displayName', () => {
      const languageWithEmptyDisplayName: Language = {
        id: '504',
        slug: 'test',
        displayName: '',
        nativeName: {
          id: 'native-504',
          primary: true,
          value: 'Native Name'
        }
      }

      const languagesWithTest = [...mockLanguages, languageWithEmptyDisplayName]
      const result = filterOptions(
        languagesWithTest,
        createFilterState('Native Name')
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('504')
    })

    it('should handle language with empty id', () => {
      const languageWithEmptyId: Language = {
        id: '',
        slug: 'test',
        displayName: 'Test Language',
        nativeName: {
          id: 'native-505',
          primary: true,
          value: 'Native Name'
        }
      }

      const languagesWithTest = [...mockLanguages, languageWithEmptyId]
      const result = filterOptions(
        languagesWithTest,
        createFilterState('Test Language')
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('')
    })
  })
})
