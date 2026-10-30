import { documentFontsHref, documentLanguage } from '../../pages/_document'

const DEFAULT_FONTS =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap'
const RTL_FONTS =
  'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&family=Tajawal:wght@400;700&display=swap'

function campaignIn(bcp47: string | null): {
  campaign: { language: { bcp47: string | null } }
} {
  return { campaign: { language: { bcp47 } } }
}

describe('_document', () => {
  describe('documentLanguage', () => {
    it('keeps the app default on a page with no campaign', () => {
      expect(documentLanguage({}, { rtl: false })).toEqual({
        lang: 'en',
        dir: ''
      })
      expect(documentLanguage(undefined, { rtl: true })).toEqual({
        lang: 'en',
        dir: 'rtl'
      })
    })

    it('stamps a left-to-right Page Language', () => {
      expect(documentLanguage(campaignIn('fr'), { rtl: true })).toEqual({
        lang: 'fr',
        dir: 'ltr'
      })
    })

    it('stamps a right-to-left Page Language', () => {
      expect(documentLanguage(campaignIn('ar'), { rtl: false })).toEqual({
        lang: 'ar',
        dir: 'rtl'
      })
    })

    it('keeps the app default when the Page Language has no bcp47 tag', () => {
      expect(documentLanguage(campaignIn(null), { rtl: false })).toEqual({
        lang: 'en',
        dir: ''
      })
    })
  })

  describe('documentFontsHref', () => {
    it('links the default fonts on a page with no campaign', () => {
      expect(documentFontsHref({}, { rtl: false, locale: 'en' })).toBe(
        DEFAULT_FONTS
      )
    })

    it('links the right-to-left fonts for a right-to-left locale other than Urdu', () => {
      expect(documentFontsHref({}, { rtl: true, locale: 'ar' })).toBe(RTL_FONTS)
      expect(documentFontsHref({}, { rtl: true, locale: 'ur' })).toBe(
        DEFAULT_FONTS
      )
    })

    it('links none on a campaign page, which links its own', () => {
      expect(
        documentFontsHref(campaignIn('fr'), { rtl: true, locale: 'ar' })
      ).toBeNull()
    })
  })
})
