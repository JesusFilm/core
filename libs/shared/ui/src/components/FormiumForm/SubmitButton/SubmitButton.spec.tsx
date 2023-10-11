import { render } from '@testing-library/react'

import { SubmitButton } from '.'

describe('SubmitButton', () => {
  it('should show default button', () => {
    const { getByRole, getByTestId } = render(
      <SubmitButton type="submit">Submit</SubmitButton>
    )

    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(getByTestId('CheckBrokenIcon')).toBeInTheDocument()
  })
})
