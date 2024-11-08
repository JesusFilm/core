import { defaultJourney } from '../../../TemplateView/data'

import { showHeader } from '.'

describe('getHeaderElements', () => {
  describe('showHeader', () => {
    it('should return false if journey or variant are nullish', () => {
      expect(showHeader(undefined, undefined)).toBe(false)
    })

    it('should return true if variant is admin', () => {
      expect(showHeader(defaultJourney, 'admin')).toBe(true)
    })

    it('should return false if logo and menu are missing', () => {
      expect(showHeader(defaultJourney, 'default')).toBe(false)
    })

    it('should return true if logo or menu are present', () => {
      const journey = {
        ...defaultJourney,
        logoImageBlock: {
          __typename: 'ImageBlock' as const,
          id: 'logoImageBlockId',
          src: 'https://example.com/logo.png',
          alt: 'Logo',
          parentBlockId: null,
          parentOrder: null,
          height: 10,
          width: 10,
          blurhash: 'blurhash',
          scale: 1,
          focalLeft: 50,
          focalTop: 50
        }
      }

      expect(showHeader(journey, 'default')).toBe(true)
    })
  })
})
