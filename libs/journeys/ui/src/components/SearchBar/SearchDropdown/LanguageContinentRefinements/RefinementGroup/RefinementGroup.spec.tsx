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
        handleLanguagesSelect={jest.fn()}
      />
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
  })

  it('should have languages listed', () => {
    render(
      <RefinementGroup
        title="Languages"
        refinement={useRefinementList}
        handleLanguagesSelect={jest.fn()}
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
        handleLanguagesSelect={jest.fn()}
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
        handleLanguagesSelect={jest.fn()}
      />
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('should handle selected continent on click', () => {
    const handleLanguagesSelect = jest.fn()
    render(
      <RefinementGroup
        title="Languages"
        refinement={useRefinementList}
        handleLanguagesSelect={handleLanguagesSelect}
      />
    )
    fireEvent.click(screen.getByText('Cantonese'))
    expect(handleLanguagesSelect).toHaveBeenCalled()
  })

  it('should check the checkbox if the language is refined and selected in the specified continent', () => {
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
        selectedLanguagesByContinent={{
          Asia: ['Cantonese']
        }}
        handleLanguagesSelect={jest.fn()}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Cantonese' })).toBeChecked()
  })

  it('should disable the checkbox if the language is selected in a different continent', () => {
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
        selectedLanguagesByContinent={{
          Europe: ['Cantonese']
        }}
        handleLanguagesSelect={jest.fn()}
      />
    )
    expect(screen.getByRole('checkbox', { name: 'Cantonese' })).toBeDisabled()
  })
})
