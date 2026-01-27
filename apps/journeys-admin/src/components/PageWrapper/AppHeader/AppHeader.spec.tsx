import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the header with all elements', () => {
    const { getByTestId, getByRole, getByAltText } = render(
      <AppHeader onClick={mockOnClick} />
    )

    expect(getByTestId('AppHeader')).toBeInTheDocument()
    expect(getByRole('banner')).toBeInTheDocument()
    expect(getByRole('button', { name: 'open drawer' })).toBeInTheDocument()
    expect(getByAltText('Next Steps')).toBeInTheDocument()
    expect(getByRole('button', { name: 'language' })).toBeInTheDocument()
  })

  it('should call onClick when menu button is clicked', () => {
    const { getByRole } = render(<AppHeader onClick={mockOnClick} />)

    const menuButton = getByRole('button', { name: 'open drawer' })
    fireEvent.click(menuButton)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should open language switcher when language button is clicked', async () => {
    const { getByRole, getByText } = render(<AppHeader onClick={mockOnClick} />)

    const languageButton = getByRole('button', { name: 'language' })
    fireEvent.click(languageButton)

    await waitFor(() =>
      expect(getByText('Change Language')).toBeInTheDocument()
    )
  })
})
