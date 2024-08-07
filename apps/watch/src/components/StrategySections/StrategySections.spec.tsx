import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'

import { strategyItems } from './StrategySection/data'
import { StrategySections } from './StrategySections'

jest.mock('react-instantsearch')

const mockedUseHits = useHits as jest.MockedFunction<typeof useHits>

describe('StrategySections', () => {
  beforeEach(() => {
    mockedUseHits.mockReturnValue({
      hits: strategyItems
    } as unknown as HitsRenderState)
  })

  it('should render strategysections', () => {
    render(<StrategySections />)
    expect(screen.getAllByTestId('StrategySection')).toHaveLength(2)
  })

  it('should render emptysearch component when no there are no hits', () => {
    mockedUseHits.mockReturnValue({
      hits: []
    } as unknown as HitsRenderState)

    render(<StrategySections />)

    expect(screen.getByText('Sorry, no results')).toBeInTheDocument()
    expect(screen.queryByTestId('StrategySection')).not.toBeInTheDocument()
  })
})
