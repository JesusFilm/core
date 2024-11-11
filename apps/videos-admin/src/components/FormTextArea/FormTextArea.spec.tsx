import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormTextArea } from './FormTextArea'

describe('FormTextArea', () => {
  it('should render with value', () => {
    render(<FormTextArea name="textarea" label="Textarea" />)

    const field = screen.getByRole('textbox', { name: 'Textarea' })
    expect(field).toBeInTheDocument()
    expect(field).toHaveValue('Textarea value')
  })
})
