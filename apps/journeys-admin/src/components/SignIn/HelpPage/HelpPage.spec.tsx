import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { HelpPage } from './HelpPage' // Adjust the path based on your project structure

describe('HelpPage Component', () => {
  const mockSetActivePage = jest.fn()

  beforeEach(() => jest.resetAllMocks())

  it('renders HelpPage component with default user email', () => {
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

  it('triggers cancel button click', () => {
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

  it('submits form with valid email', async () => {
    const { getByText } = render(
      <HelpPage
        userEmail="test@example.com"
        setActivePage={mockSetActivePage}
      />
    )

    // Trigger form submission with a valid email
    fireEvent.click(getByText('SEND'))

    // Wait for the asynchronous validation and submission
    await waitFor(() => {
      // You can add additional assertions here based on the expected behavior
    })
  })

  // Add more tests as needed, such as submitting form with invalid email, etc.
})
