import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'

import '../../../../../../test/i18n'
import { languageRefinements } from '../../../data'

import { RefinementGroup } from './RefinementGroup'

describe('RefinementGroup', () => {
  const refine = jest.fn()
  const useRefinementList = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

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

  it('should disable the checkbox if title and continent match but refinement does not', () => {
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
})
