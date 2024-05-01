import { render } from '@testing-library/react'

import { Footer } from './Footer'

describe('Footer', () => {
  it('should have Terms of use link', () => {
    const { getAllByText, getAllByRole } = render(<Footer />)
    expect(getAllByText('Terms of use')).toHaveLength(2)
    expect(getAllByRole('link', { name: 'Terms of use' })[0]).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/terms/'
    )
  })

  it('should have Legal Statement link', () => {
    const { getAllByText, getAllByRole } = render(<Footer />)
    expect(getAllByText('Legal Statement')).toHaveLength(2)
    expect(
      getAllByRole('link', { name: 'Legal Statement' })[0]
    ).toHaveAttribute('href', 'https://www.jesusfilm.org/legal/')
  })
})
