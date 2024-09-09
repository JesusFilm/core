import { renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  SearchBarState,
  SearchbarProvider,
  reducer,
  useSearchBar
} from './SearchbarProvider'

describe('SearchbarContext', () => {
  describe('reducer', () => {
    describe('SelectLanguageContinent', () => {
      it('should set a continent for the selected language', () => {
        const state = {
          continentLanguages: {}
        }
        expect(
          reducer(state, {
            type: 'SelectLanguageContinent',
            continent: 'Europe',
            language: 'English',
            isSelected: true
          })
        ).toEqual({
          continentLanguages: {
            Europe: ['English']
          }
        })
      })

      it('should retain more than one language for a continent', () => {
        const state = {
          continentLanguages: {
            Europe: ['English']
          }
        }
        expect(
          reducer(state, {
            type: 'SelectLanguageContinent',
            continent: 'Europe',
            language: 'French',
            isSelected: true
          })
        ).toEqual({
          continentLanguages: {
            Europe: ['English', 'French']
          }
        })
      })

      it('should add a language to a different continent', () => {
        const state = {
          continentLanguages: {
            Europe: ['English']
          }
        }
        expect(
          reducer(state, {
            type: 'SelectLanguageContinent',
            continent: 'Asia',
            language: 'Chinese',
            isSelected: true
          })
        ).toEqual({
          continentLanguages: {
            Europe: ['English'],
            Asia: ['Chinese']
          }
        })
      })

      it('should remove a language from a continent', () => {
        const state = {
          continentLanguages: {
            Europe: ['English', 'French']
          }
        }
        expect(
          reducer(state, {
            type: 'SelectLanguageContinent',
            continent: 'Europe',
            language: 'French',
            isSelected: false
          })
        ).toEqual({
          continentLanguages: {
            Europe: ['English']
          }
        })
      })
    })

    describe('SetDefaultLanguageContinent', () => {
      it('should set the default language for each continent', () => {
        const state = {
          continentLanguages: {}
        }
        expect(
          reducer(state, {
            type: 'SetDefaultLanguageContinent',
            continents: {
              Europe: ['English'],
              Asia: ['Chinese']
            },
            refinedItems: ['English', 'Chinese']
          })
        ).toEqual({
          continentLanguages: {
            Europe: ['English'],
            Asia: ['Chinese']
          }
        })
      })

      it('should select the first continent the language is found in', () => {
        const state = {
          continentLanguages: {}
        }
        expect(
          reducer(state, {
            type: 'SetDefaultLanguageContinent',
            continents: {
              Africa: ['English'],
              Europe: ['English'],
              Asia: ['English']
            },
            refinedItems: ['English']
          })
        ).toEqual({
          continentLanguages: {
            Africa: ['English']
          }
        })
      })
    })

    describe('RemoveLanguageContinents', () => {
      it('should remove a language from all continents', () => {
        const state = {
          continentLanguages: {
            Europe: ['English', 'French'],
            Asia: ['Chinese', 'English']
          }
        }
        expect(
          reducer(state, {
            type: 'RemoveLanguageContinents',
            language: 'English'
          })
        ).toEqual({
          continentLanguages: {
            Europe: ['French'],
            Asia: ['Chinese']
          }
        })
      })
    })
  })

  describe('SearchbarProvider', () => {
    it('should set initial state', () => {
      const state: SearchBarState = {
        continentLanguages: {}
      }

      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <SearchbarProvider initialState={state}>{children}</SearchbarProvider>
      )
      const { result } = renderHook(() => useSearchBar(), {
        wrapper
      })

      expect(result.current.state).toEqual({
        continentLanguages: {}
      })
    })
  })
})
