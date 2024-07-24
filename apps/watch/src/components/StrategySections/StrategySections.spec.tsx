import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'
import { StrategySections } from './StrategySections'

jest.mock('react-instantsearch')

describe('StrategySections', () => {
  beforeEach(() => {
    const useHitsMocked = jest.mocked(useHits)
    useHitsMocked.mockReturnValue({
      hits: []
    } as unknown as HitsRenderState)
  })

  it('should render strategysections', () => {
    render(<StrategySections />)
    expect(screen.getAllByTestId('StrategySection')).toHaveLength(2)
  })
})
