import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { type NextRouter, useRouter } from 'next/router'
import { useMenu, useSearchBox } from 'react-instantsearch'

import { useAlgoliaRouter } from '../../../libs/algolia/useAlgoliaRouter/useAlgoliaRouter'
import { languages } from '../data'

import { FilterList } from './FilterList'

jest.mock('react-instantsearch')
jest.mock('../../../libs/algolia/useAlgoliaRouter/useAlgoliaRouter')

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseMenu = useMenu as jest.MockedFunction<typeof useMenu>
const mockUseAlgoliaRouter = useAlgoliaRouter as jest.MockedFunction<typeof useAlgoliaRouter>

describe('FilterList', () => {
  const push = jest.fn()

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue({
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)

    mockUseRouter.mockReturnValue({
      push
    } as unknown as NextRouter)

    mockUseAlgoliaRouter.mockReturnValue({
      query: null,
      languageId: null,
      subtitleId: null
    })
  })

  describe('Language Filter', () => {
    const languageItems = [
      {
        count: 100,
        isRefined: false,
        value: '529',
        label: '529',
        highlighted: '529'
      }
    ]

    it('should refine by language on audio language filter', async () => {
      const refineLanguages = jest.fn()

      mockUseMenu.mockReturnValue({
        items: languageItems,
        refine: refineLanguages
      } as unknown as RefinementListRenderState)

      render(
        <FilterList languagesData={{ languages }} languagesLoading={false} />
      )

      const langaugesComboboxEl = screen.getAllByRole('combobox', {
        name: 'Search Languages'
      })[0]

      fireEvent.focus(langaugesComboboxEl)
      fireEvent.keyDown(langaugesComboboxEl, { key: 'ArrowDown' })
      await waitFor(() => screen.getAllByText('Chinese')[0])
      fireEvent.click(screen.getAllByText('Chinese')[0])
      expect(langaugesComboboxEl).toHaveValue('Chinese')
      await waitFor(() => expect(refineLanguages).toHaveBeenCalled())
    })
  })

  describe('Subtitles Filter', () => {
    const subtitleItems = [
      {
        count: 100,
        isRefined: false,
        value: '529',
        label: '529',
        highlighted: '529'
      },
      {
        count: 100,
        isRefined: false,
        value: '21028',
        label: '21028',
        highlighted: '21028'
      }
    ]

    it('should refine by subtitle on subtitle language filter', async () => {
      const refineSubtitles = jest.fn()

      mockUseMenu.mockReturnValue({
        items: subtitleItems,
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
      fireEvent.change(screen.getByRole('textbox', { name: 'Search Titles' }), {
        target: { value: 'Jesus' }
      })
      await waitFor(() => expect(refine).toHaveBeenCalled())
    })
  })
})
