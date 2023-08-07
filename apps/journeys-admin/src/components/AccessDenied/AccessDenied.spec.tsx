import { fireEvent, render } from '@testing-library/react'

import { AccessDenied } from './AccessDenied'

describe('AccessDenied', () => {
  it('should handle onClick', () => {
    const onClick = jest.fn()
    const { getAllByRole } = render(<AccessDenied handleClick={onClick} />)

    fireEvent.click(getAllByRole('button', { name: 'Request Now' })[0])
    expect(onClick).toHaveBeenCalled()
  })

  it('should show back button', () => {
    const { getByRole } = render(<AccessDenied />)

    expect(getByRole('link', { name: 'Back to my journeys' })).toHaveAttribute(
      'href',
      '/'
    )
  })
})
