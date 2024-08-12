import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'

import { strategyItems } from './data'

import { StrategySection } from '.'

jest.mock('react-instantsearch')

const mockedUseHits = useHits as jest.MockedFunction<typeof useHits>

describe('StrategySection', () => {
  beforeEach(() => {
    mockedUseHits.mockReturnValue({
      hits: strategyItems
    } as unknown as HitsRenderState)
  })

  it('should render strategysection', () => {
    render(<StrategySection index={0} handleItemSearch={jest.fn()} />)
    const items = screen.getAllByTestId('StrategyCard')
    expect(items).toHaveLength(10)

    const strategySectionTitle = screen.getByRole('heading', {
      level: 5,
      name: 'Mission Trips'
    })
    expect(strategySectionTitle).toBeInTheDocument()

    const strategyCardTitle = screen.getByRole('heading', {
      level: 6,
      name: 'London Bridges 1 One Week'
    })
    expect(strategyCardTitle).toBeInTheDocument()
  })

  it('should call handleitemsearch', () => {
    const handleItemSearchMock = jest.fn()
    render(
      <StrategySection index={0} handleItemSearch={handleItemSearchMock} />
    )

    expect(handleItemSearchMock).toHaveBeenCalled()
  })

  it('should not render strategysection if no hits', () => {
    mockedUseHits.mockReturnValue({
      hits: []
    } as unknown as HitsRenderState)

    render(<StrategySection index={0} handleItemSearch={jest.fn()} />)

    expect(screen.queryByTestId('StrategySection')).not.toBeInTheDocument()
  })
})
