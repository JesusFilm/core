import { fireEvent, render, screen } from '@testing-library/react'

import { LanguageButton } from './LanguageButton'

describe('LanguageButton', () => {
  it('should render the language button with default text', () => {
    render(<LanguageButton onClick={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument()
  })

  it('should call onClick on language button click', () => {
    const onClick = jest.fn()

    render(<LanguageButton onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Language' })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('should render the button with the selected language', () => {
    render(<LanguageButton onClick={jest.fn()} selectedLanguage="English" />)
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })
})
