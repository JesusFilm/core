import { render, screen } from '@testing-library/react'

import { ContainerHero, type ContainerHeroProps } from './ContainerHero'

describe('CollectionsPage ContainerHero re-export', () => {
  const props: ContainerHeroProps = {
    title: 'Easter',
    descriptionBeforeYear: 'Easter',
    descriptionAfterYear: 'collection',
    feedbackButtonLabel: 'Feedback',
    coverImageUrl: 'https://example.com/cover.jpg'
  }

  it('renders the hero title', () => {
    render(<ContainerHero {...props} />)

    expect(screen.getByText('Easter')).toBeInTheDocument()
  })
})
