import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'

import '../../../test/i18n'
import { languageRefinements } from '../SearchBar/data'

import { RefinementGroup } from './RefinementGroup'


describe('RefinementGroup', () => {
  const refine = jest.fn()
  const useRefinementList = {
    items: languageRefinements,
    refine
  } as unknown as RefinementListRenderState

  it('should have languages header', () => {
    render(<RefinementGroup title='Languages' refinement={useRefinementList}/>)
    expect(screen.getByText('Languages')).toBeInTheDocument()
  })

  it('should have languages listed', () => {
    render(<RefinementGroup title='Langauges' refinement={useRefinementList}/>)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish, Latin American')).toBeInTheDocument()
    expect(screen.getByText('Chinese, Mandarin')).toBeInTheDocument()
  })

  it('should refine when langauge selected', () => {
    render(<RefinementGroup title='Langauges' refinement={useRefinementList}/>)
    fireEvent.click(screen.getByText('Cantonese'))
    expect(refine).toHaveBeenCalled()
  })
})