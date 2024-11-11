import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormCheckbox } from './FormCheckbox'

describe('FormCheckbox', () => {
  const mockChange = jest.fn()

  it('should render', () => {
    render(<FormCheckbox label="Form checkbox" />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should emit change callback on check', async () => {
    render(<FormCheckbox label="Form checkbox" />)

    await userEvent.click(screen.getByRole('checkbox'))

    expect(mockChange).toHaveBeenCalledWith(false)
  })
})
