import { render, screen } from '@testing-library/react'
import { Header } from './index'

describe('Header', () => {
  it('renders correctly', () => {
    const { container } = render(<Header />)
    expect(container).toMatchSnapshot()
  })

  it('displays the JesusFilm logo', () => {
    render(<Header />)
    const logo = screen.getByAltText('JesusFilm Project')
    expect(logo).toBeInTheDocument()
  })

  it('has a search input field', () => {
    render(<Header />)
    const searchInput = screen.getByTestId('SearchField')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search videos...')
  })

  it('has a language button', () => {
    render(<Header />)
    const languageButton = screen.getByTestId('LanguageButton')
    expect(languageButton).toBeInTheDocument()
    expect(languageButton).toHaveAttribute('aria-label', 'select language')
  })

  it('has proper accessibility attributes', () => {
    render(<Header />)
    const searchInput = screen.getByTestId('SearchField')
    const languageButton = screen.getByTestId('LanguageButton')
    
    expect(searchInput).toHaveAttribute('type', 'text')
    expect(languageButton).toHaveAttribute('type', 'button')
  })

  it('has responsive classes for smaller screens', () => {
    render(<Header />)
    const header = screen.getByTestId('CollectionsHeader')
    expect(header).toHaveClass('h-[60px]', 'sm:h-[80px]', 'lg:h-[120px]')
  })
}) 