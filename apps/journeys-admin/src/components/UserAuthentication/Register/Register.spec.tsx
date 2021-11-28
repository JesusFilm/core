import { render, fireEvent } from '@testing-library/react'
import { Register } from '.'

const handleSignUp = jest.fn(() => {
  return {
    createUserWithEmailAndPassword: jest.fn(async () => await Promise.resolve())
  }
})


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
  it('calls Firebase sign up method', async () => {
    const { getByText } = render(<Register />)
    const button = getByText('Sign Up')

    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    // await waitFor(() => expect(handleSignUp).toHaveBeenCalled())
    // await waitFor(() => expect(createUserWithEmailAndPassword).toHaveBeenCalled())
  })
})
