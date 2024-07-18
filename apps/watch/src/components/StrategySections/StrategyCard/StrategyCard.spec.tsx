import { render, screen } from '@testing-library/react'
import { StrategyCard } from './StrategyCard'

describe('StrategyCard', () => {
  const item = {
    title: 'Strategy Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: 'www.jesusfilm.org'
  }
  it('should render strategy card', () => {
    render(<StrategyCard item={item} />)

    const strategyCard = screen.getByTestId('StrategyCard')
    expect(strategyCard).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 6, name: 'Strategy Title' })
    ).toBeInTheDocument()

    expect(screen.queryAllByText(item.description)[0]).toBeInTheDocument()
  })

  it('should have correct link', () => {
    render(<StrategyCard item={item} />)

    const link = screen.getByTestId('StrategyCardLink')
    expect(link).toHaveAttribute('href', item.link)
  })

  it('should have correct image properties', () => {
    render(
      <StrategyCard
        item={{ ...item, title: 'New Title', imageUrl: 'newImageUrl' }}
      />
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'newImageUrl')
    expect(image).toHaveAttribute('alt', 'New Title')
  })
})
