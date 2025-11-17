import { render, screen } from '@testing-library/react'

import { Language } from '../../libs/useLanguages'
import userEvent from '@testing-library/user-event'
import { LanguageCommandSelect } from './LanguageCommandSelect'

const mockLanguages: Language[] = [
  {
    id: 'lang-1',
    slug: 'english',
    displayName: 'English',
    englishName: { id: '1', primary: true, value: 'English' },
    nativeName: { id: '1', primary: true, value: 'English' }
  },
  {
    id: 'lang-2',
    slug: 'spanish',
    displayName: 'Spanish',
    englishName: { id: '2', primary: true, value: 'Spanish' },
    nativeName: { id: '2', primary: true, value: 'Español' }
  }
]

describe('LanguageCommandSelect', () => {
  const defaultProps = {
    options: mockLanguages,
    selectedOption: null,
    placeholder: 'Select language...',
    emptyMessage: 'No languages found.',
    loadingMessage: 'Loading languages...',
    noLanguagesMessage: 'No languages available.',
    onSelect: jest.fn()
  }

  it('renders placeholder when no option is selected', () => {
    render(<LanguageCommandSelect {...defaultProps} />)

    expect(screen.getByText('Select language...')).toBeInTheDocument()
  })

  it('renders loading message when isLoading is true', () => {
    render(<LanguageCommandSelect {...defaultProps} isLoading />)

    expect(screen.getByText('Loading languages...')).toBeInTheDocument()
  })

  it('renders noLanguagesMessage when disabled and not loading', () => {
    render(<LanguageCommandSelect {...defaultProps} disabled />)

    expect(screen.getByText('No languages available.')).toBeInTheDocument()
  })

  it('renders selected option display name', () => {
    render(<LanguageCommandSelect {...defaultProps} selectedOption={mockLanguages[0]} />)

    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('opens dropdown and shows options when clicked', async () => {
    const user = userEvent.setup()
    render(<LanguageCommandSelect {...defaultProps} />)

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()
  })

  it('calls onSelect when an option is selected', async () => {
    const onSelect = jest.fn()
    const user = userEvent.setup()
    render(<LanguageCommandSelect {...defaultProps} onSelect={onSelect} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Spanish'))

    expect(onSelect).toHaveBeenCalledWith(mockLanguages[1])
  })

  it('shows checkmark for selected option', async () => {
    const user = userEvent.setup()
    render(<LanguageCommandSelect {...defaultProps} selectedOption={mockLanguages[0]} />)

    await user.click(screen.getByRole('combobox'))

    // The checkmark should be visible for the selected option
    const checkIcon = screen.getAllByRole('img', { hidden: true }).find(icon =>
      icon.classList.contains('opacity-100')
    )
    expect(checkIcon).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<LanguageCommandSelect {...defaultProps} disabled />)

    const button = screen.getByRole('combobox')
    expect(button).toBeDisabled()
  })
})
