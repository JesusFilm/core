import { fireEvent, render, screen } from '@testing-library/react'

import { LanguageButtons } from './LanguageButtons'

describe('LanguageButtons', () => {
  it('should render the language button with default text', () => {
    render(<LanguageButtons onClick={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument()
  })

  it('should call onClick on language button click', () => {
    const onClick = jest.fn()

    render(<LanguageButtons onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Language' })
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('should render the button with the selected language', () => {
    render(<LanguageButtons onClick={jest.fn()} selectedLanguage="English" />)
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })
})
