import { fireEvent, render } from '@testing-library/react'

import { HelpPage } from './HelpPage' // Adjust the path based on your project structure

describe('HelpPage', () => {
  const mockSetActivePage = jest.fn()

  beforeEach(() => jest.resetAllMocks())

  it('should render HelpPage component with default user email', () => {
    const { getByText, getByRole } = render(
      <HelpPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )

    // Ensure that the component renders with the default user email
    expect(getByText('Sign In')).toBeInTheDocument()
    expect(
      getByText(
        'Get instructions sent to this email that explain how to reset your password'
      )
    ).toBeInTheDocument()
    expect(getByRole('textbox')).toHaveValue('test@example.com')
  })

  it('should trigger cancel button click', () => {
    const { getByRole } = render(
      <HelpPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )
    fireEvent.click(getByRole('button', { name: 'CANCEL' }))
    // Ensure that the setActivePage function is called with the correct argument
    expect(mockSetActivePage).toHaveBeenCalledWith('home')
  })
})
