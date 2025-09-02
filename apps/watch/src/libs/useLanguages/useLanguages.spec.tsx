import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, delay, http } from 'msw'
import { ReactElement } from 'react'
// eslint-disable-next-line no-restricted-imports
import { I18nextProvider } from 'react-i18next'

import { makeI18n } from '../../../test/i18n'
import { server } from '../../../test/mswServer'
import { TestSWRConfig } from '../../../test/TestSWRConfig'

import { useLanguages } from './useLanguages'

// Create a wrapper component that provides i18n context
const createI18nWrapper = async (language = 'en') => {
  const i18n = await makeI18n(language)
  return ({ children }: { children: ReactElement }) => {
    return (
      <TestSWRConfig>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </TestSWRConfig>
    )
  }
}

describe('useLanguages', () => {
  describe('loading state', () => {
    it('should return loading state when API is loading', async () => {
      server.use(
        http.get('/api/languages', async () => {
          await delay(50)
          return HttpResponse.json([])
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.languages).toEqual([])

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('data transformation', () => {
    it('should transform language data correctly with current language', async () => {
      const mockData = [
        ['529:english:English', '496:Anglais', '21028:Inglés'],
        ['496:french:Français', '529:French', '21028:Francés']
      ]

      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json(mockData)
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.languages).toHaveLength(2)
      })

      const englishLanguage = result.current.languages.find(
        (lang) => lang.id === '529'
      )
      expect(englishLanguage).toEqual({
        id: '529',
        slug: 'english',
        name: {
          id: '529',
          primary: true,
          value: 'English'
        },
        englishName: {
          id: '529',
          primary: true,
          value: 'English'
        },
        nativeName: undefined,
        displayName: 'English'
      })

      const frenchLanguage = result.current.languages.find(
        (lang) => lang.id === '496'
      )
      expect(frenchLanguage).toEqual({
        id: '496',
        slug: 'french',
        name: {
          id: '529',
          primary: false,
          value: 'French'
        },
        englishName: {
          id: '529',
          primary: false,
          value: 'French'
        },
        nativeName: {
          id: '496',
          primary: true,
          value: 'Français'
        },
        displayName: 'French'
      })
    })

    it('should handle language with only native name', async () => {
      const mockData = [['496:french:Français']]

      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json(mockData)
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toHaveLength(1)
      })

      const frenchLanguage = result.current.languages.find(
        (lang) => lang.id === '496'
      )
      expect(frenchLanguage).toEqual({
        id: '496',
        slug: 'french',
        name: undefined,
        englishName: undefined,
        nativeName: {
          id: '496',
          primary: true,
          value: 'Français'
        },
        displayName: 'Français'
      })
    })

    it('should sort languages alphabetically by display name', async () => {
      const mockData = [
        ['496:french:Français', '529:French', '21028:Francés'],
        ['529:english:English', '496:Anglais', '21028:Inglés'],
        ['21028:spanish:Español', '529:Spanish', '496:Español']
      ]

      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json(mockData)
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toHaveLength(3)
      })

      expect(result.current.languages.map((lang) => lang.displayName)).toEqual([
        'English',
        'French',
        'Spanish'
      ])
    })

    it('should use fallback display name when no name is available', async () => {
      const mockData = [['999:unknown']]

      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json(mockData)
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toHaveLength(1)
      })

      const unknownLanguage = result.current.languages.find(
        (lang) => lang.id === '999'
      )
      expect(unknownLanguage?.displayName).toBe('999')
    })
  })

  describe('language name resolution', () => {
    it('should prioritize name in current language', async () => {
      const mockData = [
        ['496:french:Français', '529:French', '21028:Francés'],
        ['529:english:English', '496:Anglais', '21028:Inglés'],
        ['21028:spanish:Español', '529:Spanish', '496:Español']
      ]

      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json(mockData)
        })
      )

      const wrapper = await createI18nWrapper('fr')
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toHaveLength(3)
      })

      const englishLanguage = result.current.languages.find(
        (lang) => lang.id === '529'
      )
      expect(englishLanguage?.name).toEqual({
        id: '496',
        primary: false,
        value: 'Anglais'
      })
      expect(englishLanguage?.displayName).toBe('Anglais')

      expect(result.current.languages.map((lang) => lang.displayName)).toEqual([
        'Anglais',
        'Español',
        'Français'
      ])
    })

    it('should use native name when current language name is not available', async () => {
      const mockData = [['496:french:Français']]

      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json(mockData)
        })
      )

      const wrapper = await createI18nWrapper('es')
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toHaveLength(1)
      })

      const frenchLanguage = result.current.languages.find(
        (lang) => lang.id === '496'
      )
      expect(frenchLanguage?.name).toBeUndefined()
      expect(frenchLanguage?.nativeName).toEqual({
        id: '496',
        primary: true,
        value: 'Français'
      })
      expect(frenchLanguage?.displayName).toBe('Français')
    })

    it('should use English name as fallback', async () => {
      const mockData = [['496:french:Français', '529:French', '21028:Francés']]

      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json(mockData)
        })
      )

      const wrapper = await createI18nWrapper('de')
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toHaveLength(1)
      })

      const frenchLanguage = result.current.languages.find(
        (lang) => lang.id === '496'
      )
      expect(frenchLanguage?.name).toEqual({
        id: '529',
        primary: false,
        value: 'French'
      })
      expect(frenchLanguage?.englishName).toEqual({
        id: '529',
        primary: false,
        value: 'French'
      })
      expect(frenchLanguage?.displayName).toBe('French')
    })
  })

  describe('edge cases', () => {
    it('should handle empty data array', async () => {
      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.json([])
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toEqual([])
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle API error', async () => {
      server.use(
        http.get('/api/languages', () => {
          return new HttpResponse('Internal Server Error', { status: 500 })
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toEqual([])
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      server.use(
        http.get('/api/languages', () => {
          return HttpResponse.error()
        })
      )

      const wrapper = await createI18nWrapper()
      const { result } = renderHook(() => useLanguages(), { wrapper })

      await waitFor(() => {
        expect(result.current.languages).toEqual([])
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
