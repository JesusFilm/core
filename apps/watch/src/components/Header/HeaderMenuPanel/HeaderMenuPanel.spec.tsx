import { fireEvent, render } from '@testing-library/react'

import { HeaderMenuPanel } from './HeaderMenuPanel'

describe('HeaderMenuPanel', () => {
  it('should close the header menu panel on close icon click', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(<HeaderMenuPanel onClose={onClose} />)
    fireEvent.click(getByTestId('CloseIcon'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should have Give link', () => {
    const { getByRole } = render(<HeaderMenuPanel onClose={jest.fn()} />)
    const el = getByRole('link', { name: 'Give' })
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/give/')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have About link', () => {
    const { getByRole } = render(<HeaderMenuPanel onClose={jest.fn()} />)
    const el = getByRole('link', { name: 'About' })
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/about/')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have Partners link', () => {
    const { getByRole } = render(<HeaderMenuPanel onClose={jest.fn()} />)
    const el = getByRole('link', { name: 'Partners' })
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/partners/')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have Blog link', () => {
    const { getByRole } = render(<HeaderMenuPanel onClose={jest.fn()} />)
    const el = getByRole('link', { name: 'Blog' })
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/blog/')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have Tools link', () => {
    const { getByRole } = render(<HeaderMenuPanel onClose={jest.fn()} />)
    const el = getByRole('link', { name: 'Tools' })
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/tools/')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have Contact link', () => {
    const { getByRole } = render(<HeaderMenuPanel onClose={jest.fn()} />)
    const el = getByRole('link', { name: 'Contact' })
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/contact/')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have Give Now button', () => {
    const { getByRole } = render(<HeaderMenuPanel onClose={jest.fn()} />)
    const el = getByRole('link', { name: 'Give Now' })
    expect(el).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html'
    )
    expect(el).not.toHaveAttribute('target')
  })
})
