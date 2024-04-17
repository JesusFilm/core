import { fireEvent, render, waitFor } from '@testing-library/react'
import { fetchSignInMethodsForEmail } from 'firebase/auth'

import { HomePage } from './HomePage'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  fetchSignInMethodsForEmail: jest.fn()
}))

describe('Home', () => {
  it('should render home page', () => {
    const { getByRole } = render(<HomePage />)
    expect(getByRole('tab', { name: 'New account' })).toHaveTextContent(
      'New account'
    )
  })

  it('should render google and facebook login buttons', () => {
    const { getByRole } = render(<HomePage />)
    expect(
      getByRole('button', { name: 'Continue with Google' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Continue with Facebook' })
    ).toBeInTheDocument()
  })

  it('should require user to enter an email', async () => {
    const { getByRole, getByText } = render(<HomePage />)

    fireEvent.click(getByRole('button', { name: 'Continue with email' }))
    await waitFor(() =>
      expect(getByText('Please enter your email address')).toBeInTheDocument()
    )
    expect(getByRole('button', { name: 'Continue with email' })).toBeDisabled()
  })

  it('should validate user email', async () => {
    const { getByRole, getByText } = render(<HomePage />)

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'Invalid Email Address' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(
        getByText('Please enter a valid email address')
      ).toBeInTheDocument()
    )
    expect(getByRole('button', { name: 'Continue with email' })).toBeDisabled()
  })

  it('should disable email sign in button on invalid click', async () => {
    const { getByRole } = render(<HomePage />)

    const signInButton = getByRole('button', { name: 'Continue with email' })
    expect(signInButton).not.toBeDisabled()
    fireEvent.click(signInButton)

    expect(signInButton).toBeDisabled()
  })

  it('should start signing in when valid email entered', async () => {
    const mockFetchSignInMethodsForEmail =
      fetchSignInMethodsForEmail as jest.MockedFunction<
        typeof fetchSignInMethodsForEmail
      >

    const { getByRole } = render(<HomePage />)

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'example@example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Continue with email' }))
    await waitFor(() =>
      expect(mockFetchSignInMethodsForEmail).toHaveBeenCalled()
    )
  })
})
