
import { render, screen, act, fireEvent } from '@testing-library/react'

import TextField, { TextFieldProps } from './TextField'

// Should limit to use only within a form - not outside
const props: TextFieldProps = {
  // __typename: 'SignUpBlock'

}

describe('TextField', () => {
  it('should show error when field has been touched and is incorrect', () => {
    render(<TextField {...props} />)

    act(() => {
      fireEvent.click(screen.getByRole('button'))
    })

    const inlineErrors = screen.getAllByText('Required')

    expect(inlineErrors[0]).toHaveProperty('id', 'name-helper-text')
    expect(inlineErrors[1]).toHaveProperty('id', 'email-helper-text')
  })
})
