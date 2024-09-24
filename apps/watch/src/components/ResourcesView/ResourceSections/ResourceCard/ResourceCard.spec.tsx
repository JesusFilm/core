import { render, screen } from '@testing-library/react'
import { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import { useHits } from 'react-instantsearch'

import { ResourceCard } from './ResourceCard'

jest.mock('react-instantsearch')

const mockUseHits = useHits as jest.MockedFunction<typeof useHits>

describe('ResourceCard', () => {
  const item = {
    title: 'Resource Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: 'www.jesusfilm.org'
  }

  beforeEach(() => {
    mockUseHits.mockReturnValue({
      hits: [item],
      sendEvent: jest.fn()
    } as unknown as HitsRenderState)
  })

  it('should render resource card', () => {
    render(<ResourceCard item={item} />)

    const resourceCard = screen.getByTestId('ResourceCard')
    expect(resourceCard).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 6, name: 'Resource Title' })
    ).toBeInTheDocument()

    expect(screen.queryAllByText(item.description)[0]).toBeInTheDocument()
  })

  it('should have correct link', () => {
    render(<ResourceCard item={item} />)

    const link = screen.getByTestId('ResourceCardLink')
    expect(link).toHaveAttribute('href', item.link)
  })

  it('should have correct image properties', () => {
    render(
      <ResourceCard
        item={{ ...item, title: 'New Title', imageUrl: 'newImageUrl' }}
      />
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'newImageUrl')
    expect(image).toHaveAttribute('alt', 'New Title')
  })
})
