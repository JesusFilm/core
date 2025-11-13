import { render, screen } from '@testing-library/react'

import { ContainerHeroVideo } from './ContainerHeroVideo'

describe('ContainerHeroVideo', () => {
  const props = {
    coverImageUrl: 'https://example.com/cover.jpg',
    coverImageAlt: 'Collection cover'
  }

  it('renders the cover image', () => {
    render(<ContainerHeroVideo {...props} />)

    const image = screen.getByTestId('ContainerHeroCoverImage')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('cover'))
  })

  it('applies the gradient overlay for readability', () => {
    render(<ContainerHeroVideo {...props} />)

    expect(
      screen.getByTestId('ContainerHeroVideoOverlay')
    ).toBeInTheDocument()
  })
})
