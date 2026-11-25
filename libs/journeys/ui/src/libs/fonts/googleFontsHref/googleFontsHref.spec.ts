import { googleFontsHref } from './googleFontsHref'

describe('googleFontsHref', () => {
  it('builds the defaults-only href when the three fonts are null', () => {
    expect(
      googleFontsHref({ headerFont: null, bodyFont: null, labelFont: null })
    ).toBe(
      'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700;800&display=swap'
    )
    expect(googleFontsHref(null)).toBe(
      googleFontsHref({ headerFont: null, bodyFont: null, labelFont: null })
    )
  })

  it('adds the three theme fonts with weights 400–800, deduplicated and sorted, display=swap', () => {
    expect(
      googleFontsHref({
        headerFont: 'Fraunces',
        bodyFont: 'Open Sans',
        labelFont: 'Barlow Condensed'
      })
    ).toBe(
      'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=El+Messiri:wght@400;500;600;700;800&family=Fraunces:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700;800&display=swap'
    )
  })
})
