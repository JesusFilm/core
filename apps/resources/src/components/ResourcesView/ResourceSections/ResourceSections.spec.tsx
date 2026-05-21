import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'
import type { MockedFunction } from 'vitest'

import { resourceItems } from './ResourceSection/data'
import { ResourceSections } from './ResourceSections'

vi.mock('react-instantsearch')

const mockedUseHits = useHits as MockedFunction<typeof useHits>

describe('ResourceSections', async () => {
  beforeEach(() => {
    mockedUseHits.mockReturnValue({
      hits: resourceItems
    } as unknown as HitsRenderState)
    vi.clearAllMocks()
  })

  it('should render ResourceSections', () => {
    render(<ResourceSections />)
    expect(screen.getAllByText('Mission Trips')[0]).toBeInTheDocument()
    expect(
      screen.getAllByText('London Bridges 1 One Week')[0]
    ).toBeInTheDocument()
  })

  it('should render emptysearch component when no there are no hits', () => {
    mockedUseHits.mockReturnValue({
      hits: []
    } as unknown as HitsRenderState)

    render(<ResourceSections />)

    expect(screen.getByText('Sorry, no results')).toBeInTheDocument()
    expect(screen.queryByTestId('StrategySection')).not.toBeInTheDocument()
  })
})
