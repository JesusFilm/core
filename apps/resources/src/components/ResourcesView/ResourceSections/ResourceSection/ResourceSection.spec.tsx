import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'

import { resourceItems } from './data'

import { ResourceSection } from '.'

jest.mock('react-instantsearch')

const mockedUseHits = useHits as jest.MockedFunction<typeof useHits>

describe('ResourceSection', () => {
  beforeEach(() => {
    mockedUseHits.mockReturnValue({
      hits: resourceItems
    } as unknown as HitsRenderState)
  })

  it('should render ResourceSection', () => {
    render(<ResourceSection index={0} handleItemSearch={jest.fn()} />)
    const items = screen.getAllByTestId('ResourceCard')
    expect(items).toHaveLength(10)

    const resourceSectionTitle = screen.getByRole('heading', {
      level: 5,
      name: 'Mission Trips'
    })
    expect(resourceSectionTitle).toBeInTheDocument()

    const resourceCardTitle = screen.getByRole('heading', {
      level: 6,
      name: 'London Bridges 1 One Week'
    })
    expect(resourceCardTitle).toBeInTheDocument()
  })

  it('should call handleitemsearch', () => {
    const handleItemSearchMock = jest.fn()
    render(
      <ResourceSection index={0} handleItemSearch={handleItemSearchMock} />
    )

    expect(handleItemSearchMock).toHaveBeenCalled()
  })

  it('should not render ResourceSection if no hits', () => {
    mockedUseHits.mockReturnValue({
      hits: []
    } as unknown as HitsRenderState)

    render(<ResourceSection index={0} handleItemSearch={jest.fn()} />)

    expect(screen.queryByTestId('ResourceSection')).not.toBeInTheDocument()
  })
})
