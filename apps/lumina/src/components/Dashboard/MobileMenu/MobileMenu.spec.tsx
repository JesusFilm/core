import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MobileMenu } from './MobileMenu'

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

jest.mock('../Sidebar', () => ({
  Sidebar: jest.fn(() => <div data-testid="sidebar">Sidebar</div>)
}))

describe('MobileMenu', () => {
  it('does not render when closed', () => {
    render(<MobileMenu isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByText('Lumina AI')).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<MobileMenu isOpen={true} onClose={onClose} />)
    const backdrop = screen.getByLabelText('Close menu').closest('div')?.previousSibling
    if (backdrop) {
      await user.click(backdrop as HTMLElement)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<MobileMenu isOpen={true} onClose={onClose} />)
    const closeButton = screen.getByLabelText('Close menu')
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('sets body overflow to hidden when open', () => {
    render(<MobileMenu isOpen={true} onClose={jest.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body overflow when closed', () => {
    const { rerender } = render(<MobileMenu isOpen={true} onClose={jest.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<MobileMenu isOpen={false} onClose={jest.fn()} />)
    expect(document.body.style.overflow).toBe('')
  })
})

