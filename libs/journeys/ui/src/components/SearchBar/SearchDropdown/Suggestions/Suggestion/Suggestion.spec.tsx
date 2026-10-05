import MenuList from '@mui/material/MenuList'
import { render, screen } from '@testing-library/react'

import { Suggestion, SuggestionVariant } from '.'

describe('Suggestion', () => {
  const handleClick = vi.fn()

  it('should display default query', () => {
    render(<Suggestion handleClick={handleClick} />, { wrapper: MenuList })
    expect(screen.getByText('Jesus')).toBeInTheDocument()
  })

  it('should display default filters', () => {
    render(<Suggestion handleClick={handleClick} />, { wrapper: MenuList })
    expect(screen.getByText('- in English and Spanish')).toBeInTheDocument()
  })

  it('should display default variant label', () => {
    render(<Suggestion handleClick={handleClick} />, { wrapper: MenuList })
    expect(screen.getByText('Language')).toBeInTheDocument()
  })

  it('should display prop query', () => {
    render(<Suggestion query="Love" handleClick={handleClick} />, {
      wrapper: MenuList
    })
    expect(screen.getByText('Love')).toBeInTheDocument()
  })

  it('should display prop filters', () => {
    render(
      <Suggestion filters={['French', 'Arabic']} handleClick={handleClick} />,
      { wrapper: MenuList }
    )
    expect(screen.getByText('- in French and Arabic')).toBeInTheDocument()
  })

  it('should display prop variant label', () => {
    render(
      <Suggestion variant={SuggestionVariant.TAG} handleClick={handleClick} />,
      { wrapper: MenuList }
    )
    expect(screen.getByText('Tag')).toBeInTheDocument()
  })
})
