import { render, screen } from '@testing-library/react'

import { BibleQuote } from './BibleQuote'

describe('BibleQuote', () => {
  const mockProps = {
    imageUrl: 'https://example.com/image.jpg',
    bgColor: '#123456',
    children: <p data-testid="quote-content">{'Test Bible Quote Content'}</p>
  }

  it('renders with the provided image URL and content', () => {
    render(<BibleQuote {...mockProps} />)

    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockProps.imageUrl)
    expect(image).toHaveAttribute('alt', 'Bible quote')

    const content = screen.getByTestId('quote-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveTextContent('Test Bible Quote Content')
  })

  it('applies the provided background color', () => {
    render(<BibleQuote {...mockProps} />)

    const container = screen
      .getByTestId('quote-content')
      .closest('div')?.parentElement
    expect(container).toHaveStyle(`background-color: ${mockProps.bgColor}`)
  })

  it('uses the default background color when not provided', () => {
    const propsWithoutBgColor = {
      imageUrl: mockProps.imageUrl,
      children: mockProps.children
    }

    render(<BibleQuote {...propsWithoutBgColor} />)

    const container = screen
      .getByTestId('quote-content')
      .closest('div')?.parentElement
    expect(container).toHaveStyle('background-color: #1A1815') // Default color from component
  })
})
