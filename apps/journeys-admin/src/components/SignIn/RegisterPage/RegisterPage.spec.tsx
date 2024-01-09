import { fireEvent, render, waitFor } from '@testing-library/react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import { RegisterPage } from './RegisterPage'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('PasswordPage', () => {
  it('should render register page', () => {
    const { getByText, getByRole } = render(
      <RegisterPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    expect(getByText('Create account')).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Email' })).toHaveValue(
      'example@example.com'
    )
  })

  it('should require user to enter a name and password', async () => {
    const { getByText, getByRole } = render(
      <RegisterPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(getByText('Enter your password')).toBeInTheDocument()
    )
    expect(getByText('Enter your account name')).toBeInTheDocument()
  })

  it('should allow user to create an account', async () => {
    const mockCreateUserWithEmailAndPassword =
      createUserWithEmailAndPassword as jest.MockedFunction<
        typeof createUserWithEmailAndPassword
      >

    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as jest.MockedFunction<
        typeof signInWithEmailAndPassword
      >

    const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByLabelText, getByRole } = render(
      <RegisterPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    fireEvent.change(getByLabelText('Name'), {
      target: { value: 'First name last name' }
    })

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/users/terms-and-conditions'
      })
    })
  })

  it('should validate password', async () => {
    const { getByLabelText, getByText } = render(
      <RegisterPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )
    fireEvent.change(getByLabelText('Password'), {
      target: { value: '123' }
    })
    fireEvent.blur(getByLabelText('Password'))
    await waitFor(() =>
      expect(
        getByText('Password must be at least 6 characters long')
      ).toBeInTheDocument()
    )
  })

  it('should check if name is too short', async () => {
    const { getByLabelText, getByText } = render(
      <RegisterPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )
    fireEvent.change(getByLabelText('Name'), {
      target: { value: 'a' }
    })
    fireEvent.blur(getByLabelText('Name'))
    await waitFor(() => expect(getByText('Too Short!')).toBeInTheDocument())
  })

  it('should check if name is too long', async () => {
    const { getByLabelText, getByText } = render(
      <RegisterPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )
    fireEvent.change(getByLabelText('Name'), {
      target: {
        value:
          'This is a very very very very very very very very very very very very very very long name'
      }
    })
    fireEvent.blur(getByLabelText('Name'))
    await waitFor(() => expect(getByText('Too Long!')).toBeInTheDocument())
  })

  it('should go back to home page when cancel is clicked', async () => {
    const mockSetActivePage = jest.fn()
    const { getByRole } = render(
      <RegisterPage
        setActivePage={mockSetActivePage}
        userEmail="example@example.com"
      />
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(mockSetActivePage).toHaveBeenCalledWith('home')
    })
  })
})
