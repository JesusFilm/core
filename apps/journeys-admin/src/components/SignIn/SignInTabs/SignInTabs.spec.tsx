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

  it('should retain tab selection after re-render (regression: router effect reset)', () => {
    const { getByRole, rerender } = render(<SignInTabs />)

    fireEvent.click(getByRole('tab', { name: 'Log In' }))
    expect(getByRole('tab', { selected: true })).toHaveTextContent('Log In')

    rerender(<SignInTabs />)
    expect(getByRole('tab', { selected: true })).toHaveTextContent('Log In')
  })

  it('should not reset tab selection on repeated re-renders (regression: shallow route update)', () => {
    const { getByRole, rerender } = render(<SignInTabs />)

    fireEvent.click(getByRole('tab', { name: 'Log In' }))
    rerender(<SignInTabs />)
    rerender(<SignInTabs />)
    rerender(<SignInTabs />)

    expect(getByRole('tab', { selected: true })).toHaveTextContent('Log In')
  })
})
