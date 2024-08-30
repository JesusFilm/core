import { render, screen } from '@testing-library/react'

import { LanguageButton } from './LanguageButton'

describe('LanguageButton', () => {
  it('should render the language button with default text and icons', () => {
    render(<LanguageButton content="Language" />)

    expect(screen.getByTestId('Globe1Icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByTestId('ChevronDownIcon')).toBeInTheDocument()
  })

  it('should render the button with a selected language and icons', () => {
    render(<LanguageButton content="English" isRefined />)

    expect(screen.getByTestId('Globe1Icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
  })

  it('should call handleClick on language button click', () => {
    const handleClick = jest.fn()

    render(<LanguageButton content="English" handleClick={handleClick} />)

    const button = screen.getByRole('button', { name: 'English' })
    button.click()
    expect(handleClick).toHaveBeenCalled()
  })
})
