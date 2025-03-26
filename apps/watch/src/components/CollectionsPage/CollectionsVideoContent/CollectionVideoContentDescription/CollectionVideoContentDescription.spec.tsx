import { render, screen } from '@testing-library/react'

import { CollectionVideoContentDescription } from './CollectionVideoContentDescription'

describe('CollectionVideoContentDescription', () => {
  const mockProps = {
    subtitle: 'Test Subtitle',
    title: 'Test Title',
    description:
      'This is a test description with more than three words to check styling.'
  }

  it('renders the component with provided props', () => {
    render(<CollectionVideoContentDescription {...mockProps} />)

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()

    expect(screen.getByText('Test Title')).toBeInTheDocument()

    const firstThreeWords = mockProps.description
      .split(' ')
      .slice(0, 3)
      .join(' ')
    expect(
      screen.getByText(firstThreeWords, { exact: false })
    ).toBeInTheDocument()
  })

  it('applies proper styling to first three words of description', () => {
    render(<CollectionVideoContentDescription {...mockProps} />)

    const descriptionElement = screen.getByText(/This is a/, { exact: false })

    expect(descriptionElement).toHaveStyle({
      fontWeight: 'bold',
      color: 'white'
    })
  })

  it('handles empty description gracefully', () => {
    const emptyDescProps = {
      ...mockProps,
      description: ''
    }

    render(<CollectionVideoContentDescription {...emptyDescProps} />)

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
