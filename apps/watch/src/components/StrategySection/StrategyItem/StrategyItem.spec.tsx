import { render, screen } from '@testing-library/react'
import { StrategyItem } from './StrategyItem'

describe('StrategyItem', () => {
  const item = {
    title: 'Strategy Title',
    description: 'description',
    id: 'test-id',
    imageUrl: '',
    link: ''
  }
  it('should render strategy item', () => {
    render(<StrategyItem item={item} />)

    const strategyItem = screen.getByTestId('StrategyItem')
    expect(strategyItem).toBeInTheDocument()

    expect(strategyItem).toHaveTextContent(item.title)
    expect(strategyItem).toHaveTextContent(item.description)
  })

  it('should have correct link', () => {
    render(<StrategyItem item={item} />)

    const link = screen.getByTestId('StrategyItemLink')
    expect(link).toHaveAttribute('href', item.link)
  })

  // TODO: uncomment this test when algolia imageUrl is introduced
  //
  //   it('should have correct image properties', () => {
  //     render(
  //       <StrategyItem
  //         item={{ ...item, title: 'New Title', imageUrl: 'newImageUrl' }}
  //       />
  //     )

  //     const image = screen.getByRole('img')
  //     expect(image).toHaveAttribute('src', item.imageUrl)
  //     expect(image).toHaveAttribute('alt', item.title)
  //   })
})
