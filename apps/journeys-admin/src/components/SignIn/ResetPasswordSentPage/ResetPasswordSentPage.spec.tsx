import { fireEvent, render, waitFor } from '@testing-library/react'

import { ResetPasswordSentPage } from './ResetPasswordSentPage'

describe('ResetPasswordSentPage', () => {
  it('should render if email instructions have been sent properly', () => {
    const { getByText } = render(
      <ResetPasswordSentPage
        userEmail="test@exampleemail.com"
        activePage="google.com"
      />
    )

    expect(getByText('Check your email')).toBeInTheDocument()
    expect(
      getByText('Follow the instructions sent to', { exact: false })
    ).toBeInTheDocument()
    expect(getByText('test@exampleemail.com')).toBeInTheDocument()
    expect(
      getByText('to recover your password', { exact: false })
    ).toBeInTheDocument()
  })

  it('should redirect home after finishing email reset', async () => {
    const mockSetActivePage = jest.fn()
    const { getByRole } = render(
      <ResetPasswordSentPage
        setActivePage={mockSetActivePage}
        userEmail="test@exampleemail.com"
        activePage="google.com"
      />
    )
    fireEvent.click(getByRole('button', { name: 'Done' }))
    await waitFor(() => {
      expect(mockSetActivePage).toHaveBeenCalledWith('home')
    })
  })
})
