import { render, screen } from '@testing-library/react'
import { StrategyItemProps } from './StrategyCard/StrategyCard'
import { StrategySection } from './StrategySection'

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
  ] as Array<StrategyItemProps>
  it('should render strategysection', () => {
    render(<StrategySection />)
    expect(screen.getByTestId('StrategySection')).toBeInTheDocument()
  })

  it('should render 3 strategy items', () => {
    render(<StrategySection />)

    const items = screen.getAllByTestId('StrategyCard')
    expect(items).toHaveLength(9)

    expect(items[0]).toHaveTextContent('Title 1')
  })
})
