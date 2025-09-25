import { render, screen } from '@testing-library/react'

import { SectionPartners } from './SectionPartners'

describe('SectionPartners', () => {
  it('renders the heading and call to action', () => {
    render(<SectionPartners />)

    expect(
      screen.getByRole('heading', { name: 'Our Partners' })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Become a Partner' })
    ).toHaveAttribute('href', 'mailto:partners@jesusfilm.org')
  })

  it('displays partner logos in the carousel', () => {
    const { getAllByTestId } = render(<SectionPartners />)

    expect(getAllByTestId('SectionPartnersSlide')).toHaveLength(5)
  })
})
