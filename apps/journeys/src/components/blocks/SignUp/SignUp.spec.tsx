import { render, screen, act, fireEvent } from '@testing-library/react'

import SignUp, { SignUpProps } from './SignUp'

const props: SignUpProps = {
  __typename: 'SignUpBlock',
  id: '1',
  parentBlockId: '0'
}

describe('SignUp', () => {
  it('should validate when fields are empty', async () => {
    render(<SignUp {...props} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button'))
    })

    const inlineErrors = screen.getAllByText('Required')

    expect(inlineErrors[0]).toHaveProperty('id', 'name-helper-text')
    expect(inlineErrors[1]).toHaveProperty('id', 'email-helper-text')
  })

  it('should validate when name is too short', async () => {
    render(<SignUp {...props} />)

    const name = screen.getByLabelText('Name')
    const submit = screen.getByRole('button')
    const inlineError = screen.findByText('Name must be 2 characters or more')

    await act(async () => {
      fireEvent.change(name, { target: { value: 'S' } })
    })
    await act(async () => {
      fireEvent.click(submit)
    })

    expect(await inlineError).toHaveProperty('id', 'name-helper-text')
  })

  it('should validate when name is too long', async () => {
    render(<SignUp {...props} />)

    const name = screen.getByLabelText('Name')
    const submit = screen.getByRole('button')
    const inlineError = screen.findByText('Name must be 50 characters or less')

    await act(async () => {
      fireEvent.change(name, { target: { value: '123456789012345678901234567890123456789012345678901' } })
    })
    await act(async () => {
      fireEvent.click(submit)
    })

    expect(await inlineError).toHaveProperty('id', 'name-helper-text')
  })

  it('should validate when email is invalid', async () => {
    render(<SignUp {...props} />)

    const name = screen.getByLabelText('Email')
    const submit = screen.getByRole('button')
    const inlineError = screen.findByText('Please enter a valid email address')

    await act(async () => {
      fireEvent.change(name, { target: { value: '123abc@' } })
    })
    await act(async () => {
      fireEvent.click(submit)
    })

    expect(await inlineError).toHaveProperty('id', 'email-helper-text')
  })

  // it('should show loading button on form submit', async () => {
  // })

  // it('should show error when submit fails', async () => {
  // })
})
