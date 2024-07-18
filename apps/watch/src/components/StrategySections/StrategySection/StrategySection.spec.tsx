import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'
import { StrategySection } from '.'
import { newStrategyItems } from './data'

jest.mock('react-instantsearch')

describe('StrategySection', () => {
  beforeEach(() => {
    const useHitsMocked = jest.mocked(useHits)
    useHitsMocked.mockReturnValue({
      hits: newStrategyItems
    } as unknown as HitsRenderState)
  })

  it('should render strategysection', () => {
    render(<StrategySection />)
    expect(screen.getByTestId('StrategySection')).toBeInTheDocument()
    const items = screen.getAllByTestId('StrategyCard')
    expect(items).toHaveLength(2)

    // title of strategy section
    expect(
      screen.getByRole('heading', { level: 4, name: 'Mission Trips' })
    ).toBeInTheDocument()
    // title of first strategy card
    expect(
      screen.getByRole('heading', {
        level: 6,
        name: 'London Bridges 1 One Week'
      })
    ).toBeInTheDocument()
  })
})
