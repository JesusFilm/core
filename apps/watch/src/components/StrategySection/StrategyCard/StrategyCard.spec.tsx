import { render, screen } from '@testing-library/react'
import { StrategyCard } from './StrategyCard'

describe('StrategyCard', () => {
  const item = {
    title: 'Strategy Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: ''
  }
  it('should render strategy card', () => {
    render(<StrategyCard item={item} />)

    const strategyCard = screen.getByTestId('StrategyCard')
    expect(strategyCard).toBeInTheDocument()

    expect(strategyCard).toHaveTextContent(item.title)
    expect(strategyCard).toHaveTextContent(item.description)
  })

  it('should have correct link', () => {
    render(<StrategyCard item={item} />)

    const link = screen.getByTestId('StrategyCardLink')
    expect(link).toHaveAttribute('href', item.link)
  })

  // TODO: uncomment this test when algolia imageUrl is introduced
  //
  //   it('should have correct image properties', () => {
  //     render(
  //       <StrategyCard
  //         item={{ ...item, title: 'New Title', imageUrl: 'newImageUrl' }}
  //       />
  //     )

  //     const image = screen.getByRole('img')
  //     expect(image).toHaveAttribute('src', item.imageUrl)
  //     expect(image).toHaveAttribute('alt', item.title)
  //   })
})
