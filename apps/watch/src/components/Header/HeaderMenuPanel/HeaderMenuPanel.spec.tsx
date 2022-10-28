import { render, fireEvent } from '@testing-library/react'
import { HeaderMenuPanel } from './HeaderMenuPanel'

describe('HeaderMenuPanel', () => {
  const toggleMenuPanel = jest.fn()
  it('should display a list of menus', () => {
    const { getByText } = render(
      <HeaderMenuPanel toggleMenuPanel={toggleMenuPanel} />
    )
    expect(getByText('About')).toBeInTheDocument()
    expect(getByText('Contact')).toBeInTheDocument()
    expect(getByText('Collections')).toBeInTheDocument()
  })

  it('should close drawer on item click', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleMenuPanel={toggleMenuPanel} />
    )
    fireEvent.click(getByRole('button', { name: 'About' }))
    expect(toggleMenuPanel).toHaveBeenCalled()
  })
})
