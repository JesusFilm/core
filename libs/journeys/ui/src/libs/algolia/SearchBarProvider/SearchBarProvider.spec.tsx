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
    allContinentLanguages: {}
  }

  describe('reducer', () => {
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
          continentLanguages: {
            Europe: ['English']
          }
        })
      })

      it('should retain more than one language for a continent', () => {
        const state = {
          continentLanguages: {
            Europe: ['English']
          },
          allContinentLanguages: {}
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
          continentLanguages: {
            Europe: ['English', 'French']
          }
        })
      })

      it('should add a language to a different continent', () => {
        const state = {
          continentLanguages: {
            Europe: ['English']
          },
          allContinentLanguages: {}
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
          },
          allContinentLanguages: {}
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
          continentLanguages: {
            Europe: ['English']
          }
        })
      })
    })

    describe('SetDefaultLanguageContinent', () => {
      it('should set the default language for each continent', () => {
        const state = {
          continentLanguages: {},
          allContinentLanguages: {
            Europe: ['English'],
            Asia: ['Chinese']
          }
        }
        expect(
          reducer(state, {
            type: 'SetDefaultLanguageContinent',
            refinedItems: ['English', 'Chinese']
          })
        ).toEqual({
          ...state,
          continentLanguages: {
            Europe: ['English'],
            Asia: ['Chinese']
          }
        })
      })

      it('should select the first continent the language is found in', () => {
        const state = {
          continentLanguages: {},
          allContinentLanguages: {
            Africa: ['English'],
            Europe: ['English'],
            Asia: ['English']
          }
        }
        expect(
          reducer(state, {
            type: 'SetDefaultLanguageContinent',
            refinedItems: ['English']
          })
        ).toEqual({
          ...state,
          continentLanguages: {
            Africa: ['English']
          }
        })
      })
    })

    describe('RemoveLanguageContinents', () => {
      const state = {
        continentLanguages: {
          Europe: ['English', 'French'],
          Asia: ['Chinese', 'English']
        },
        allContinentLanguages: {}
      }

      it('should remove a language from all continents', () => {
        expect(
          reducer(state, {
            type: 'RemoveLanguageContinents',
            languages: ['English']
          })
        ).toEqual({
          ...state,
          continentLanguages: {
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
          continentLanguages: {
            Europe: [],
            Asia: ['Chinese']
          }
        })
      })
    })

    describe('RemoveAllLanguageContinents', () => {
      it('should remove all languages from all continents', () => {
        const state = {
          continentLanguages: {
            Europe: ['English', 'French'],
            Asia: ['Chinese', 'English']
          },
          allContinentLanguages: {}
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
