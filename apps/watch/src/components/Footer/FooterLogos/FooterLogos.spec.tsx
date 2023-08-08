import { render } from '@testing-library/react'

import { FooterLogos } from './FooterLogos'

describe('FooterLogos', () => {
  it('should have the jesus film logo link', () => {
    const { getByAltText } = render(<FooterLogos />)
    const el = getByAltText('Jesus Film logo').closest('a')
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have the cru logo link', () => {
    const { getByAltText } = render(<FooterLogos />)
    const el = getByAltText('Cru logo').closest('a')
    expect(el).toHaveAttribute('href', 'https://www.cru.org')
    expect(el).toHaveAttribute('target', '_blank')
  })
})
