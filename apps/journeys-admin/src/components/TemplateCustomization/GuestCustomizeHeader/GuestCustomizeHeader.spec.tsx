import { fireEvent, render } from '@testing-library/react'

import { GuestCustomizeHeader } from './GuestCustomizeHeader'

const mockPush = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    asPath: '/templates/123/customize',
    query: {}
  })
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      language: 'en'
    }
  })
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  )
}))

describe('GuestCustomizeHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the home button', () => {
    const { getByRole } = render(<GuestCustomizeHeader />)
    expect(getByRole('button', { name: 'home' })).toBeInTheDocument()
  })

  it('should navigate to home on home button click', () => {
    const { getByRole } = render(<GuestCustomizeHeader />)
    fireEvent.click(getByRole('button', { name: 'home' }))
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should render the logo', () => {
    const { getByAltText } = render(<GuestCustomizeHeader />)
    expect(getByAltText('Next Steps')).toBeInTheDocument()
  })

  it('should render the language button', () => {
    const { getByRole } = render(<GuestCustomizeHeader />)
    expect(getByRole('button', { name: 'language' })).toBeInTheDocument()
  })

  it('should open language switcher on language button click', () => {
    const { getByRole, getByText } = render(<GuestCustomizeHeader />)
    fireEvent.click(getByRole('button', { name: 'language' }))
    expect(getByText('Change Language')).toBeInTheDocument()
  })

  it('should display the current language code', () => {
    const { getByText } = render(<GuestCustomizeHeader />)
    expect(getByText('en')).toBeInTheDocument()
  })

  it('should have white background', () => {
    const { getByTestId } = render(<GuestCustomizeHeader />)
    expect(getByTestId('GuestCustomizeHeader')).toBeInTheDocument()
  })
})
