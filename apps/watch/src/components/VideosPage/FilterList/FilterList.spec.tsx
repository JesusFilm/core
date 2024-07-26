import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ClearRefinementsRenderState } from 'instantsearch.js/es/connectors/clear-refinements/connectClearRefinements'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { NextRouter, useRouter } from 'next/router'
import {
  useClearRefinements,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'
import { languages } from '../testData'
import { FilterList } from './FilterList'

jest.mock('react-instantsearch')

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
const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>
const mockUseClearRefinements = useClearRefinements as jest.MockedFunction<
  typeof useClearRefinements
>

describe('FilterList', () => {
  const push = jest.fn()

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue({
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)

    mockUseRouter.mockReturnValue({
      push
    } as unknown as NextRouter)

    mockUseClearRefinements.mockReturnValue({
      refine: jest.fn()
    } as unknown as ClearRefinementsRenderState)

    jest.clearAllMocks()
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

    it('should refine and update url on audio language filter', async () => {
      const refineLanguages = jest.fn()

      mockUseRefinementList.mockReturnValue({
        items: languageItems,
        refine: refineLanguages
      } as unknown as RefinementListRenderState)

      render(
        <FilterList
          filter={{}}
          languagesData={{ languages }}
          languagesLoading={false}
        />
      )

      const langaugesComboboxEl = screen.getAllByRole('combobox', {
        name: 'Search Languages'
      })[0]

      fireEvent.focus(langaugesComboboxEl)
      fireEvent.keyDown(langaugesComboboxEl, { key: 'ArrowDown' })
      await waitFor(() => screen.getAllByText('English')[0])
      fireEvent.click(screen.getAllByText('English')[0])
      expect(langaugesComboboxEl).toHaveValue('English')
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith(
          '/watch/videos?languages=529',
          undefined,
          { shallow: true }
        )
      )
      expect(refineLanguages).toHaveBeenCalled()
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
    it('should refine and update url on subtitle language filter', async () => {
      const refineSubtitles = jest.fn()

      mockUseRefinementList.mockReturnValue({
        items: subtitleItems,
        refine: refineSubtitles
      } as unknown as RefinementListRenderState)

      render(
        <FilterList
          filter={{}}
          languagesData={{ languages }}
          languagesLoading={false}
        />
      )

      const subtitleComboboxEl = screen.getAllByRole('combobox', {
        name: 'Search Languages'
      })[1]

      fireEvent.focus(subtitleComboboxEl)
      fireEvent.keyDown(subtitleComboboxEl, { key: 'ArrowDown' })
      await waitFor(() => screen.getAllByText('English')[0])
      fireEvent.click(screen.getAllByText('English')[0])
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith(
          '/watch/videos?subtitles=529',
          undefined,
          { shallow: true }
        )
      )
      expect(refineSubtitles).toHaveBeenCalled()
    })
  })

  describe('Search Filter', () => {
    it('should refine and update url on title search', async () => {
      const refine = jest.fn()

      mockUseSearchBox.mockReturnValue({
        refine
      } as unknown as SearchBoxRenderState)

      render(
        <FilterList
          filter={{}}
          languagesData={{ languages }}
          languagesLoading={false}
        />
      )
      fireEvent.change(screen.getByRole('textbox', { name: 'Search Titles' }), {
        target: { value: 'Jesus' }
      })
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith(
          '/watch/videos?title=Jesus',
          undefined,
          { shallow: true }
        )
      )
      expect(refine).toHaveBeenCalled()
    })
  })
})
