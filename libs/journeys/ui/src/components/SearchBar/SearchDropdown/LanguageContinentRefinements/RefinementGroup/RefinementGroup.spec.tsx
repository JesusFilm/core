import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'
import '../../../../../../test/i18n'

import { languageRefinements } from '../../../data'

import { RefinementGroup, normalizeLanguage } from './RefinementGroup'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('RefinementGroup', () => {
  const refine = jest.fn()

  const useRefinementList = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

  const useSearchBox = {
    query: 'Hello World!',
    refine
  } as unknown as SearchBoxRenderState

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue(useSearchBox)
  })

  it('should have languages header', () => {
    render(
      <RefinementGroup
        title="Languages"
        refinement={useRefinementList}
        handleSelectedContinent={jest.fn()}
      />
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
  })

  it('should have languages listed', () => {
    render(
      <RefinementGroup
        title="Languages"
        refinement={useRefinementList}
        handleSelectedContinent={jest.fn()}
      />
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Latin American')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Mandarin')).toBeInTheDocument()
  })

  it('should refine when langauge selected', () => {
    render(
      <RefinementGroup
        title="Languages"
        refinement={useRefinementList}
        handleSelectedContinent={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('Cantonese'))
    expect(refine).toHaveBeenCalled()
  })

  it('should render header but no options when refinements list is empty', () => {
    const emptyRefinementList = {
      items: [],
      refine
    } as unknown as RefinementListRenderState
    render(
      <RefinementGroup
        title="Languages"
        refinement={emptyRefinementList}
        handleSelectedContinent={jest.fn()}
      />
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('should handle selected continent on click', () => {
    const handleSelectedContinent = jest.fn()
    render(
      <RefinementGroup
        title="Languages"
        refinement={useRefinementList}
        handleSelectedContinent={handleSelectedContinent}
      />
    )
    fireEvent.click(screen.getByText('Cantonese'))
    expect(handleSelectedContinent).toHaveBeenCalled()
  })

  it('should check the checkbox if title, continent, and refinement match', () => {
    const useRefinementListWithRefinedValue = {
      items: [
        {
          label: 'Cantonese',
          value: 'Cantonese',
          isRefined: true
        }
      ],
      refine
    } as unknown as RefinementListRenderState

    render(
      <RefinementGroup
        title="Asia"
        refinement={useRefinementListWithRefinedValue}
        selectedContinent="Asia"
        handleSelectedContinent={jest.fn()}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Cantonese' })).toBeChecked()
  })

  it.skip('should disable the checkbox if title and continent match but refinement does not', () => {
    const useRefinementListWithRefinedValue = {
      items: [
        {
          label: 'Cantonese',
          value: 'Cantonese',
          isRefined: true
        }
      ],
      refine
    } as unknown as RefinementListRenderState

    render(
      <RefinementGroup
        title="Asia"
        refinement={useRefinementListWithRefinedValue}
        selectedContinent="Europe"
        handleSelectedContinent={jest.fn()}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Cantonese' })).toBeDisabled()
  })

  it('should normalise empty language name', () => {
    expect(normalizeLanguage('')).toBe('')
  })

  it('should normalise french language name', () => {
    expect(normalizeLanguage('French')).toBe('french')
  })

  it('should normalise spanish language name', () => {
    expect(normalizeLanguage('Spanish, Latin American')).toBe('spanish')
  })

  it('should normalise quecha language name', () => {
    expect(
      normalizeLanguage('Quechua, Huanuco, Huamalies-Northern Dos De Mayo')
    ).toBe('quechua')
  })

  it('should not refine query when no language in query', () => {
    const useRefinementListWithRefinedValue = {
      items: [
        {
          label: 'Russian',
          value: 'Russian',
          isRefined: true
        }
      ],
      refine
    } as unknown as RefinementListRenderState

    const refineQuery = jest.fn()
    const useSearchBox = {
      query: 'Hello World!',
      refineQuery
    } as unknown as SearchBoxRenderState
    mockUseSearchBox.mockReturnValue(useSearchBox)

    render(
      <RefinementGroup
        title="Asia"
        refinement={useRefinementListWithRefinedValue}
        selectedContinent="Europe"
        handleSelectedContinent={jest.fn()}
      />
    )
    expect(refineQuery).not.toHaveBeenCalled()
  })

  it('should not refine query when refinement being unselected', () => {
    const useRefinementListWithRefinedValue = {
      items: [
        {
          label: 'Russian',
          value: 'Russian',
          isRefined: true
        }
      ],
      refine
    } as unknown as RefinementListRenderState

    const refineQuery = jest.fn()
    const useSearchBox = {
      query: 'Hello World!',
      refineQuery
    } as unknown as SearchBoxRenderState
    mockUseSearchBox.mockReturnValue(useSearchBox)

    render(
      <RefinementGroup
        title="Asia"
        refinement={useRefinementListWithRefinedValue}
        selectedContinent="Europe"
        handleSelectedContinent={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('Russian'))
    expect(refineQuery).not.toHaveBeenCalled()
  })

  it('should refine query with language-striped query when language in query', async () => {
    const refineQuery = jest.fn()
    const useSearchBox = {
      query: 'Jesus Chinese',
      refine: refineQuery
    } as unknown as SearchBoxRenderState
    mockUseSearchBox.mockReturnValue(useSearchBox)

    render(
      <RefinementGroup
        title="Asia"
        refinement={useRefinementList}
        selectedContinent="Europe"
        handleSelectedContinent={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('Chinese, Traditional'))
    await waitFor(() => expect(refineQuery).toHaveBeenCalledWith('Jesus'))
  })
})
