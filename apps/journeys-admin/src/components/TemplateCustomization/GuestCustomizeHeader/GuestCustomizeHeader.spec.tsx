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

jest.mock('next-i18next/pages', () => ({
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

  it('should render the logo in the header', () => {
    const { getByAltText } = render(<GuestCustomizeHeader />)
    expect(getByAltText('Next Steps')).toBeInTheDocument()
  })

  it('should navigate to home on logo click', () => {
    const { getByRole } = render(<GuestCustomizeHeader />)
    fireEvent.click(getByRole('button', { name: 'home' }))
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should render the language button with globe icon', () => {
    const { getByRole } = render(<GuestCustomizeHeader />)
    expect(getByRole('button', { name: 'language' })).toBeInTheDocument()
  })

  it('should not display locale text in language button', () => {
    const { queryByText } = render(<GuestCustomizeHeader />)
    expect(queryByText('en')).not.toBeInTheDocument()
  })

  it('should open language switcher on language button click', () => {
    const { getByRole, getByText } = render(<GuestCustomizeHeader />)
    fireEvent.click(getByRole('button', { name: 'language' }))
    expect(getByText('Change Language')).toBeInTheDocument()
  })

  it('should render the header', () => {
    const { getByTestId } = render(<GuestCustomizeHeader />)
    expect(getByTestId('GuestCustomizeHeader')).toBeInTheDocument()
  })
})
