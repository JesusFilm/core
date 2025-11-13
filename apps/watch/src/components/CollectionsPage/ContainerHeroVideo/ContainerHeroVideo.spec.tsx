import { render, screen } from '@testing-library/react'

import { ContainerHeroVideo } from './ContainerHeroVideo'

describe('CollectionsPage ContainerHeroVideo re-export', () => {
  it('renders the cover image overlay', () => {
    render(
      <ContainerHeroVideo
        coverImageUrl="https://example.com/cover.jpg"
        coverImageAlt="Cover"
      />
    )

    expect(screen.getByTestId('ContainerHeroCoverImage')).toBeInTheDocument()
  })
})
