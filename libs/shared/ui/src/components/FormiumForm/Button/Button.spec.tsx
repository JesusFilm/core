import { render } from '@testing-library/react'

import { Button } from '.'

describe('Button', () => {
  it('should show back button', () => {
    const { getByText, getByTestId } = render(
      <Button type="button">Back</Button>
    )
    expect(getByText('Back')).toBeInTheDocument()
    expect(getByTestId('ArrowLeftIcon')).toBeInTheDocument()
  })

  it('should show next button', () => {
    const { getByText, getByTestId } = render(
      <Button type="submit">Next</Button>
    )
    expect(getByText('Next')).toBeInTheDocument()
    expect(getByTestId('ArrowRightIcon')).toBeInTheDocument()
  })
})
