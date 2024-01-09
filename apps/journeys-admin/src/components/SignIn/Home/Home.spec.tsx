import { fireEvent, render, waitFor } from '@testing-library/react'

import { Home } from './Home'

describe('Home', () => {
  it('should render home page', () => {
    const { getByText } = render(
      <Home setActivePage={jest.fn()} setEmail={jest.fn()} />
    )
    expect(getByText('Log in or Sign up')).toBeInTheDocument()
    expect(
      getByText("No account? We'll create one for you automatically.")
    ).toBeInTheDocument()
  })

  it('should require user to enter an email', async () => {
    const { getByRole, getByText } = render(
      <Home setActivePage={jest.fn()} setEmail={jest.fn()} />
    )

    fireEvent.focus(getByRole('textbox'))
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
    expect(getByRole('button', { name: 'Sign in with email' })).toBeDisabled()
  })

  it('should validate user email', async () => {
    const { getByRole, getByText } = render(
      <Home setActivePage={jest.fn()} setEmail={jest.fn()} />
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
    expect(getByRole('button', { name: 'Sign in with email' })).toBeDisabled()
  })
})
