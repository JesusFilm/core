import { render } from '@testing-library/react'

import { NavigationButton } from '.'

describe('NavigationButton', () => {
  it('should be selected', () => {
    const { getByRole } = render(
      <NavigationButton selected value="value" link="/some/link" />
    )
    expect(getByRole('link', { name: 'value' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should have link', () => {
    const { getByRole } = render(
      <NavigationButton selected value="value" link="/some/link" />
    )
    expect(getByRole('link', { name: 'value' })).toHaveAttribute(
      'href',
      '/some/link'
    )
  })
})
