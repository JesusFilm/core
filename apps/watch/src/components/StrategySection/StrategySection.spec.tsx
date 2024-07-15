import { render, screen } from '@testing-library/react'
import { StrategyCarouselItemProps, StrategySection } from './StrategySection'

describe('StrategySection', () => {
  const StrategyItems = [
    {
      title: 'Title 0',
      description: 'description 0',
      id: 'test-id',
      imageUrl: '',
      link: ''
    },
    {
      title: 'Title 1',
      description: 'description 1',
      id: 'test-id',
      imageUrl: '',
      link: ''
    },
    {
      title: 'Title 2',
      description: 'description 2',
      id: 'test-id',
      imageUrl: '',
      link: ''
    }
  ] as Array<StrategyCarouselItemProps>
  it('should render strategysection', () => {
    render(<StrategySection items={[]} />)
    expect(screen.getByTestId('StrategySection')).toBeInTheDocument()
  })

  it('should render button stack', () => {
    render(<StrategySection items={[]} />)
    expect(screen.getByTestId('ButtonStack')).toBeInTheDocument()
  })

  it('should render 3 strategy items', () => {
    render(<StrategySection items={StrategyItems} />)

    const items = screen.getAllByTestId('StrategyItem')
    expect(items).toHaveLength(3)

    expect(items[0]).toHaveTextContent('Title 0')
  })
})
