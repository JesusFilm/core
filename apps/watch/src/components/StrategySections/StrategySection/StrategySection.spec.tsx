import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'
import { StrategySection } from '.'
import { emptyStrategyItems, strategyItems } from './data'

jest.mock('react-instantsearch')

describe('StrategySection', () => {
  beforeEach(() => {
    const useHitsMocked = jest.mocked(useHits)
    useHitsMocked.mockReturnValue({
      hits: strategyItems
    } as unknown as HitsRenderState)
  })

  it('should render strategysection', () => {
    render(<StrategySection index={0} handleItemSearch={jest.fn()} />)
    const items = screen.getAllByTestId('StrategyCard')
    expect(items).toHaveLength(2)

    // title of strategy section
    expect(
      screen.getByRole('heading', { level: 5, name: 'Mission Trips' })
    ).toBeInTheDocument()
    // title of first strategy card
    expect(
      screen.getByRole('heading', {
        level: 6,
        name: 'London Bridges 1 One Week'
      })
    ).toBeInTheDocument()
  })

  it('should not render strategysection if no hits', () => {
    const useHitsMocked = jest.mocked(useHits)
    useHitsMocked.mockReturnValue({
      hits: emptyStrategyItems
    } as unknown as HitsRenderState)

    render(<StrategySection index={0} handleItemSearch={jest.fn()} />)

    expect(screen.queryByTestId('StrategySection')).not.toBeInTheDocument()
  })
})
