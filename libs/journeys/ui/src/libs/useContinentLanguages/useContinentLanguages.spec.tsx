import { act, renderHook } from '@testing-library/react'

import { useContinentLanguages } from './useContinentLanguages'

describe('useContinentLanguages', () => {
  it('should initialize with empty selectedLanguagesByContinent', () => {
    const { result } = renderHook(() => useContinentLanguages())
    expect(result.current.selectedLanguagesByContinent).toBeUndefined()
  })

  it('should add a language to a continent', () => {
    const { result } = renderHook(() => useContinentLanguages())

    act(() => {
      result.current.selectLanguageForContinent('Europe', 'English', true)
    })

    expect(result.current.selectedLanguagesByContinent).toEqual({
      Europe: ['English']
    })
  })

  it('should remove a language from a continent', () => {
    const { result } = renderHook(() => useContinentLanguages())

    act(() => {
      result.current.selectLanguageForContinent('Europe', 'English', true)
      result.current.selectLanguageForContinent('Europe', 'French', true)
    })
    expect(result.current.selectedLanguagesByContinent).toEqual({
      Europe: ['English', 'French']
    })

    act(() => {
      result.current.selectLanguageForContinent('Europe', 'English', false)
    })
    expect(result.current.selectedLanguagesByContinent).toEqual({
      Europe: ['French']
    })
  })

  it('should add languages to multiple continents', () => {
    const { result } = renderHook(() => useContinentLanguages())

    act(() => {
      result.current.selectLanguageForContinent('Europe', 'English', true)
      result.current.selectLanguageForContinent('Asia', 'Chinese', true)
      result.current.selectLanguageForContinent('Europe', 'French', true)
    })
    expect(result.current.selectedLanguagesByContinent).toEqual({
      Europe: ['English', 'French'],
      Asia: ['Chinese']
    })
  })

  it('should remove a language from all continents', () => {
    const { result } = renderHook(() => useContinentLanguages())

    act(() => {
      result.current.selectLanguageForContinent('Europe', 'English', true)
    })
    expect(result.current.selectedLanguagesByContinent).toEqual({
      Europe: ['English']
    })

    act(() => {
      result.current.removeLanguageFromAllContinents('English')
    })
    expect(result.current.selectedLanguagesByContinent).toEqual({
      Europe: []
    })
  })

  it('should handle removing a non-existent language', () => {
    const { result } = renderHook(() => useContinentLanguages())

    act(() => {
      result.current.selectLanguageForContinent('Europe', 'English', true)
    })
    act(() => {
      result.current.removeLanguageFromAllContinents('Spanish')
    })
    expect(result.current.selectedLanguagesByContinent).toEqual({
      Europe: ['English']
    })
  })
})
