import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'
import { StrategySection } from '.'
import { StrategyItemProps } from '../StrategyCard/StrategyCard'
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
  })

  it('should render 2 strategy items', () => {
    render(<StrategySection />)
    expect(newStrategyItems).toHaveLength(2)
    const items = screen.getAllByTestId('StrategyCard')
    expect(items).toHaveLength(2)
  })

  it('should render correct title', () => {
    render(<StrategySection />)
    expect(screen.getByTestId('StrategySectionTitle')).toHaveTextContent(
      `${newStrategyItems[0].post_type_label}` // 'Mission Trips'
    )
  })
})
