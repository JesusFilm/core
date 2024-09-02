import { render, screen } from '@testing-library/react'

import { Suggestion, SuggestionVariant } from '.'

describe('Suggestion', () => {
  const handleClick = jest.fn()

  it('should display default query', () => {
    render(<Suggestion handleClick={handleClick} />)
    expect(screen.getByText('Jesus')).toBeInTheDocument()
  })

  it('should display default filters', () => {
    render(<Suggestion handleClick={handleClick} />)
    expect(
      screen.getByText('in English and Spanish, Latin American')
    ).toBeInTheDocument()
  })

  it('should display default variant label', () => {
    render(<Suggestion handleClick={handleClick} />)
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('should display prop query', () => {
    render(<Suggestion query="Love" handleClick={handleClick} />)
    expect(screen.getByText('Love')).toBeInTheDocument()
  })

  it('should display prop filters', () => {
    render(
      <Suggestion
        filters={['French', 'Arabic, Modern Standard']}
        handleClick={handleClick}
      />
    )
    expect(
      screen.getByText('in French and Arabic, Modern Standard')
    ).toBeInTheDocument()
  })

  it('should display prop variant label', () => {
    render(
      <Suggestion variant={SuggestionVariant.TAG} handleClick={handleClick} />
    )
    expect(screen.getByText('Tag')).toBeInTheDocument()
  })
})
