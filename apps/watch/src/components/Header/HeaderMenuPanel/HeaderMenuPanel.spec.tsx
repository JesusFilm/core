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
    const { getByText } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByText('About').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/about'
    )
  })
  it('should redirect to Jesus Film Aive page', () => {
    const { getByText } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByText('Give').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/give'
    )
  })
  it('should redirect to Jesus Film Partner page', () => {
    const { getByText } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByText('Partner').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/partners'
    )
  })
  it('should redirect to Jesus Film Tools page', () => {
    const { getByText } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByText('Tools').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/tools'
    )
  })
  it('should redirect to Jesus Film Blog page', () => {
    const { getByText } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(getByText('Blog').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/blog'
    )
  })
  it('should redirect to Jesus Film Give Now page', () => {
    const { getByRole } = render(
      <HeaderMenuPanel toggleDrawer={toggleDrawer} />
    )
    expect(
      getByRole('button', { name: 'Give Now' }).closest('a')
    ).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now-2/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=https%3A%2F%2Fwww.jesusfilm.org%2Fcontent%2Fjf%2Fus%2Fdevelopment%2Fspecial%2Fthank-you-refer%2Fsocial-share.html'
    )
  })
})
