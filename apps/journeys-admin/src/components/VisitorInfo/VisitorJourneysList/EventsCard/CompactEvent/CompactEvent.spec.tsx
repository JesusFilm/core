import { fireEvent, render } from '@testing-library/react'

import { CompactEvent } from '.'

describe('CompactEvent', () => {
  it('should handle click', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <CompactEvent value="test value" handleClick={onClick} />
    )

    fireEvent.click(getByRole('button', { name: 'test value' }))
    expect(onClick).toHaveBeenCalled()
  })
})
