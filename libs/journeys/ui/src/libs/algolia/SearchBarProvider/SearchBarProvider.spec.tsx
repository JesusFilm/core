import { MockedProvider } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { ReactNode } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { getLanguagesContinentsMock } from '../../useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'

import {
  SearchBarProvider,
  SearchBarState,
  reducer,
  useSearchBar
} from './SearchBarProvider'

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('SearchBarContext', () => {
  const initState: SearchBarState = {
    continentLanguages: {},
    selectedContinentLanguages: {}
  }

  describe('reducer', () => {
    describe('SetAllContinentLanguages', () => {
      it('should set empty continent languages', () => {
        expect(
          reducer(initState, {
            type: 'SetAllContinentLanguages',
            continentLanguages: {}
          })
        ).toEqual(initState)
      })

      it('should set all continent languages', () => {
        expect(
          reducer(initState, {
            type: 'SetAllContinentLanguages',
            continentLanguages: {
              Europe: ['English']
            }
          })
        ).toEqual({
          ...initState,
          continentLanguages: {
            Europe: ['English']
          }
        })
      })
    })

    describe('SelectLanguageContinent', () => {
      it('should set a continent for the selected language', () => {
        expect(
          reducer(initState, {
            type: 'SelectLanguageContinent',
            continent: 'Europe',
            language: 'English',
            isSelected: true
          })
        ).toEqual({
          ...initState,
          selectedContinentLanguages: {
            Europe: ['English']
          }
        })
      })

      it('should retain more than one language for a continent', () => {
        const state = {
          continentLanguages: {},
          selectedContinentLanguages: {
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
          ...state,
          selectedContinentLanguages: {
            Europe: ['English', 'French']
          }
        })
      })

      it('should add a language to a different continent', () => {
        const state = {
          continentLanguages: {},
          selectedContinentLanguages: {
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
          ...state,
          selectedContinentLanguages: {
            Europe: ['English'],
            Asia: ['Chinese']
          }
        })
      })

      it('should remove a language from a continent', () => {
        const state = {
          continentLanguages: {},
          selectedContinentLanguages: {
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
          ...state,
          selectedContinentLanguages: {
            Europe: ['English']
          }
        })
      })
    })

    describe('SetDefaultLanguageContinent', () => {
      it('should set the default language for each continent', () => {
        const state = {
          continentLanguages: {
            Europe: ['English'],
            Asia: ['Chinese']
          },
          selectedContinentLanguages: {}
        }
        expect(
          reducer(state, {
            type: 'SetDefaultLanguageContinent',
            refinedItems: ['English', 'Chinese']
          })
        ).toEqual({
          ...state,
          selectedContinentLanguages: {
            Europe: ['English'],
            Asia: ['Chinese']
          }
        })
      })

      it('should select the first continent the language is found in', () => {
        const state = {
          continentLanguages: {
            Africa: ['English'],
            Europe: ['English'],
            Asia: ['English']
          },
          selectedContinentLanguages: {}
        }
        expect(
          reducer(state, {
            type: 'SetDefaultLanguageContinent',
            refinedItems: ['English']
          })
        ).toEqual({
          ...state,
          selectedContinentLanguages: {
            Africa: ['English']
          }
        })
      })
    })

    describe('RemoveLanguageContinents', () => {
      const state = {
        continentLanguages: {},
        selectedContinentLanguages: {
          Europe: ['English', 'French'],
          Asia: ['Chinese', 'English']
        }
      }

      it('should remove a language from all continents', () => {
        expect(
          reducer(state, {
            type: 'RemoveLanguageContinents',
            languages: ['English']
          })
        ).toEqual({
          ...state,
          selectedContinentLanguages: {
            Europe: ['French'],
            Asia: ['Chinese']
          }
        })
      })

      it('should remove multiple languages from continents', () => {
        expect(
          reducer(state, {
            type: 'RemoveLanguageContinents',
            languages: ['English', 'French']
          })
        ).toEqual({
          ...state,
          selectedContinentLanguages: {
            Europe: [],
            Asia: ['Chinese']
          }
        })
      })
    })

    describe('RemoveAllLanguageContinents', () => {
      it('should remove all languages from all continents', () => {
        const state = {
          continentLanguages: {},
          selectedContinentLanguages: {
            Europe: ['English', 'French'],
            Asia: ['Chinese', 'English']
          }
        }
        expect(
          reducer(state, {
            type: 'RemoveAllLanguageContinents'
          })
        ).toEqual(initState)
      })
    })
  })

  describe('SearchBarProvider', () => {
    const useRefinementsList = {
      items: [],
      refine: jest.fn()
    } as unknown as RefinementListRenderState

    beforeEach(() => {
      mockUseRefinementList.mockReturnValue(useRefinementsList)
    })

    it('should set initial state', () => {
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <MockedProvider mocks={[getLanguagesContinentsMock]}>
          <SearchBarProvider initialState={initState}>
            {children}
          </SearchBarProvider>
        </MockedProvider>
      )
      const { result } = renderHook(() => useSearchBar(), {
        wrapper
      })

      expect(result.current.state).toEqual(initState)
    })
  })
})
