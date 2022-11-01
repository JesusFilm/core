import { render, fireEvent } from '@testing-library/react'
import { HeaderMenuPanel } from './HeaderMenuPanel'

describe('HeaderMenuPanel', () => {
  const toggleDrawer = jest.fn()
  it('should close the header menu panel on close icon click', () => {
    const { getByTestId } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    fireEvent.click(getByTestId('CloseIcon'))
    expect(toggleDrawer).toHaveBeenCalled()
  })
  it('should redirect to Jesus Film About page', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/about'
    )
  })
  it('should redirect to Jesus Film Give page', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByRole('link', { name: 'Give' })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/give'
    )
  })
  it('should redirect to Jesus Film Partner page', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByRole('link', { name: 'Partner' })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/partners'
    )
  })
  it('should redirect to Jesus Film Tools page', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByRole('link', { name: 'Tools' })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/tools'
    )
  })
  it('should redirect to Jesus Film Blog page', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/blog'
    )
  })
  it('should redirect to Jesus Film Give Now page', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByRole('link', { name: 'Give Now' })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html'
    )
  })
})
