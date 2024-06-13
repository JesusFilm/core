import { fireEvent, render } from '@testing-library/react'

import { SignInTabs } from './SignInTabs'

describe('SignInTabs', () => {
  it('should select new account tab by default', () => {
    const { getByRole } = render(<SignInTabs />)

    fireEvent.click(getByRole('tab', { name: 'New account' }))
    expect(getByRole('tab', { selected: true })).toHaveTextContent(
      'New account'
    )
  })

  it('should select login tab when clicked', () => {
    const { getByRole } = render(<SignInTabs />)

    fireEvent.click(getByRole('tab', { name: 'Log In' }))
    expect(getByRole('tab', { selected: true })).toHaveTextContent('Log In')
  })
})
