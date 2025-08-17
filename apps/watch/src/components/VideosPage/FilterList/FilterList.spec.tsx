import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MenuRenderState } from 'instantsearch.js/es/connectors/menu/connectMenu'
import type { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useMenu, useSearchBox } from 'react-instantsearch'

import {
  FilterParams,
  useAlgoliaRouter
} from '../../../libs/algolia/useAlgoliaRouter'
import { languages } from '../data'

import { languageIdRefinements, subtitleIdRefinements } from './data'
import { FilterList } from './FilterList'

jest.mock('react-instantsearch')
jest.mock('../../../libs/algolia/useAlgoliaRouter/useAlgoliaRouter')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseMenu = useMenu as jest.MockedFunction<typeof useMenu>
const mockUseAlgoliaRouter = useAlgoliaRouter as jest.MockedFunction<
  typeof useAlgoliaRouter
>

describe('FilterList', () => {
  const useSearchBox = {
    refine: jest.fn()
  } as unknown as SearchBoxRenderState

  const useMenu = {
    refine: jest.fn()
  } as unknown as MenuRenderState

  const useAlgoliaRouter: FilterParams = {
    query: null,
    languageId: null,
    subtitleId: null,
    languageEnglishName: null
  }

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(useSearchBox)
    mockUseMenu.mockReturnValue(useMenu)
    mockUseAlgoliaRouter.mockReturnValue(useAlgoliaRouter)
  })

  describe('Language Filter', () => {
    it('should refine by language on audio language filter', async () => {
      const refineLanguages = jest.fn()
      mockUseMenu.mockReturnValue({
        items: languageIdRefinements,
        refine: refineLanguages
      } as unknown as RefinementListRenderState)

      render(
        <FilterList languagesData={{ languages }} languagesLoading={false} />
      )

      const LanguagesComboboxEl = screen.getAllByRole('combobox', {
        name: 'Search Languages'
      })[0]

      fireEvent.focus(LanguagesComboboxEl)
      fireEvent.keyDown(LanguagesComboboxEl, { key: 'ArrowDown' })
      await waitFor(() => screen.getAllByText('Chinese')[0])
      fireEvent.click(screen.getAllByText('Chinese')[0])
      expect(LanguagesComboboxEl).toHaveValue('Chinese')
      await waitFor(() => expect(refineLanguages).toHaveBeenCalled())
    })
  })

  describe('Subtitles Filter', () => {
    it('should refine by subtitle on subtitle language filter', async () => {
      const refineSubtitles = jest.fn()
      mockUseMenu.mockReturnValue({
        items: subtitleIdRefinements,
        refine: refineSubtitles
      } as unknown as RefinementListRenderState)

      render(
        <FilterList languagesData={{ languages }} languagesLoading={false} />
      )

      const subtitleComboboxEl = screen.getAllByRole('combobox', {
        name: 'Search Languages'
      })[1]

      fireEvent.focus(subtitleComboboxEl)
      fireEvent.keyDown(subtitleComboboxEl, { key: 'ArrowDown' })
      await waitFor(() => screen.getAllByText('English')[0])
      fireEvent.click(screen.getAllByText('English')[0])
      await waitFor(() => expect(refineSubtitles).toHaveBeenCalled())
    })
  })

  describe('Search Filter', () => {
    it('should refine by title on title search', async () => {
      const refine = jest.fn()
      mockUseSearchBox.mockReturnValue({
        refine
      } as unknown as SearchBoxRenderState)

      render(
        <FilterList languagesData={{ languages }} languagesLoading={false} />
      )
      fireEvent.change(
        screen.getByRole('searchbox', { name: 'Search Titles' }),
        {
          target: { value: 'Jesus' }
        }
      )
      await waitFor(() => expect(refine).toHaveBeenCalledTimes(1))
      expect(refine).toHaveBeenCalledWith('Jesus')
    })
  })
})
