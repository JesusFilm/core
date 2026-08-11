import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { fetchSignInMethodsForEmail } from 'firebase/auth'
import { type MockedFunction } from 'vitest'

import { HomePage } from './HomePage'

vi.mock('firebase/auth', () => ({
  fetchSignInMethodsForEmail: vi.fn()
}))

vi.mock('../../../libs/auth', () => ({
  getFirebaseAuth: vi.fn(() => ({ currentUser: null })),
  login: vi.fn(),
  loginWithCredential: vi.fn()
}))

describe('Home', () => {
  it('should render home page', () => {
    const { getByRole } = render(
      <MockedProvider>
        <HomePage />
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'New account' })).toHaveTextContent(
      'New account'
    )
  })

  it('should render google and facebook login buttons', () => {
    const { getByRole } = render(
      <MockedProvider>
        <HomePage />
      </MockedProvider>
    )
    expect(
      getByRole('button', { name: 'Continue with Google' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Continue with Facebook' })
    ).toBeInTheDocument()
  })

  it('should require user to enter an email', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <HomePage />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Continue with email' }))
    await waitFor(() =>
      expect(getByText('Please enter your email address')).toBeInTheDocument()
    )
    expect(getByRole('button', { name: 'Continue with email' })).toBeDisabled()
  })

  it('should validate user email', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <HomePage />
      </MockedProvider>
    )

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
    const { getByRole } = render(
      <MockedProvider>
        <HomePage />
      </MockedProvider>
    )

    const signInButton = getByRole('button', { name: 'Continue with email' })
    expect(signInButton).not.toBeDisabled()
    fireEvent.click(signInButton)

    expect(signInButton).toBeDisabled()
  })

  it('should start signing in when valid email entered', async () => {
    const mockFetchSignInMethodsForEmail =
      fetchSignInMethodsForEmail as MockedFunction<
        typeof fetchSignInMethodsForEmail
      >

    const { getByRole } = render(
      <MockedProvider>
        <HomePage />
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'example@example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Continue with email' }))
    await waitFor(() =>
      expect(mockFetchSignInMethodsForEmail).toHaveBeenCalled()
    )
  })

  it('should show a loading indicator on the button while submitting', async () => {
    const mockFetchSignInMethodsForEmail =
      fetchSignInMethodsForEmail as MockedFunction<
        typeof fetchSignInMethodsForEmail
      >
    let resolveFetch!: (result: string[]) => void
    mockFetchSignInMethodsForEmail.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    const { getByRole } = render(
      <MockedProvider>
        <HomePage />
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'example@example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Continue with email' }))

    await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())

    await act(async () => {
      resolveFetch([])
      await Promise.resolve()
    })
  })
})
