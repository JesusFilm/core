import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'

import '../../../../../../test/i18n'
import { SearchbarProvider } from '../../../../../libs/SearchbarProvider'
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
      <SearchbarProvider>
        <RefinementGroup title="Languages" refinement={useRefinementList} />
      </SearchbarProvider>
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
  })

  it('should have languages listed', () => {
    render(
      <SearchbarProvider>
        <RefinementGroup title="Languages" refinement={useRefinementList} />
      </SearchbarProvider>
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Latin American')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Mandarin')).toBeInTheDocument()
  })

  it('should refine when langauge selected', () => {
    render(
      <SearchbarProvider>
        <RefinementGroup title="Languages" refinement={useRefinementList} />
      </SearchbarProvider>
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
      <SearchbarProvider>
        <RefinementGroup title="Languages" refinement={emptyRefinementList} />
      </SearchbarProvider>
    )
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
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
      <SearchbarProvider
        initialState={{
          continentLanguages: {
            Asia: ['Cantonese']
          }
        }}
      >
        <RefinementGroup
          title="Asia"
          refinement={useRefinementListWithRefinedValue}
        />
      </SearchbarProvider>
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
      <SearchbarProvider
        initialState={{
          continentLanguages: {
            Europe: ['Cantonese']
          }
        }}
      >
        <RefinementGroup
          title="Asia"
          refinement={useRefinementListWithRefinedValue}
        />
      </SearchbarProvider>
    )
    expect(screen.getByRole('checkbox', { name: 'Cantonese' })).toBeDisabled()
  })
})
