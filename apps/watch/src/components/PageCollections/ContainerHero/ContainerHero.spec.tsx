import { render, screen } from '@testing-library/react'

import { ContainerHero, type ContainerHeroProps } from './ContainerHero'

describe('ContainerHero', () => {
  const defaultProps: ContainerHeroProps = {
    title: 'Easter',
    descriptionBeforeYear: 'Easter',
    descriptionAfterYear:
      'videos & resources about Lent, Holy Week, Resurrection',
    feedbackButtonLabel: 'Feedback',
    coverImageUrl: 'https://example.com/hero.jpg',
    languageSlug: 'english'
  }

  it('renders title and description text', () => {
    render(<ContainerHero {...defaultProps} />)

    expect(screen.getByText('Easter')).toBeInTheDocument()
    expect(screen.getByTestId('ContainerHeroDescription')).toHaveTextContent(
      'Easter'
    )
  })

  it('renders the cover image component', () => {
    render(<ContainerHero {...defaultProps} />)

    expect(screen.getByTestId('ContainerHeroVideo')).toBeInTheDocument()
  })

  it('passes feedback label to header support link', () => {
    render(
      <ContainerHero
        {...defaultProps}
        feedbackButtonLabel="Share feedback"
      />
    )

    expect(screen.getByTestId('LanguageButton')).toBeInTheDocument()
  })
})
