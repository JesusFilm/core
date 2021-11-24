import { render, fireEvent } from '@testing-library/react'
import { Register } from '.'
import firebase from 'firebase/compat/app'

const authMockObject = {
  createUserWithEmailAndPassword: jest.fn(
    async () => await Promise.resolve(true)
  )
}

const authMock = jest.fn(() => authMockObject)

firebase.auth = authMock

describe('Register', () => {
  it('should render register form', () => {
    const { getByText } = render(<Register />)
    expect(getByText('First Name')).toBeInTheDocument()
    expect(getByText('Last Name')).toBeInTheDocument()
    expect(getByText('Email Address')).toBeInTheDocument()
    expect(getByText('Password')).toBeInTheDocument()
  })

  // TODO: Add mock test for sign up on click
  // TODO: Add error test for sign up
  it('calls Firebase sign up method', () => {
    const { getByText } = render(<Register />)
    const button = getByText('Sign Up')

    fireEvent.click(button)
    expect(firebase.auth().createUserWithEmailAndPassword).toHaveBeenCalled()
  })
})
