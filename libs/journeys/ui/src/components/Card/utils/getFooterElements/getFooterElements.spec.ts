import { defaultJourney } from '../../../TemplateView/data'
import { journey } from '../../../TemplateView/TemplateFooter/data'

import {
  FULL_HEIGHT,
  HALF_HEIGHT,
  MIN_HEIGHT,
  WEBSITE_HEIGHT,
  getFooterMobileHeight,
  getFooterMobileSpacing,
  getTitle,
  hasChatWidget,
  hasHostAvatar,
  hasHostDetails,
  hasReactions
} from './getFooterElements'

describe('getFooterElements', () => {
  describe('hasReactions', () => {
    it('should return false by default', () => {
      expect(
        hasReactions({ journey: defaultJourney, variant: undefined })
      ).toBe(false)
    })

    it('should return true if journey has share button', () => {
      expect(
        hasReactions({
          journey: { ...defaultJourney, showShareButton: true },
          variant: undefined
        })
      ).toBe(true)
    })

    it('should return true if journey has like button', () => {
      expect(
        hasReactions({
          journey: { ...defaultJourney, showLikeButton: true },
          variant: undefined
        })
      ).toBe(true)
    })

    it('should return true if journey has dislike button', () => {
      expect(
        hasReactions({
          journey: { ...defaultJourney, showDislikeButton: true },
          variant: undefined
        })
      ).toBe(true)
    })
  })

  describe('hasHostAvatar', () => {
    it('should return true is variant is admin', () => {
      expect(
        hasHostAvatar({
          variant: 'admin'
        })
      ).toBe(true)
    })

    it('should return true is journey host has at least one src', () => {
      expect(
        hasHostAvatar({
          journey: {
            ...defaultJourney,
            host: {
              id: 'hostId',
              src1: 'someimageurl',
              src2: null,
              __typename: 'Host',
              teamId: 'teamId',
              title: 'Johnathan Joestar',
              location: 'England'
            }
          }
        })
      ).toBe(true)
      expect(
        hasHostAvatar({
          journey: {
            ...defaultJourney,
            host: {
              id: 'hostId',
              src1: null,
              src2: 'someimageurl',
              __typename: 'Host',
              teamId: 'teamId',
              title: 'Johnathan Joestar',
              location: 'England'
            }
          }
        })
      ).toBe(true)
    })
  })

  describe('hasHostDetails', () => {
    it('should do check is a journey host has details', () => {
      expect(hasHostDetails({ journey: defaultJourney })).toBe(false)
    })
  })

  describe('hasChatWidget', () => {
    it('should return false by default', () => {
      expect(hasChatWidget({ journey: defaultJourney })).toBe(false)
    })

    it('should return true if variant is admin', () => {
      expect(hasChatWidget({ journey: defaultJourney, variant: 'admin' })).toBe(
        true
      )
    })

    it('should return true if journey has chat widgets', () => {
      expect(
        hasChatWidget({
          journey: {
            ...defaultJourney,
            chatButtons: [
              {
                __typename: 'ChatButton',
                id: 'chatButtonId',
                link: null,
                platform: null
              }
            ]
          },
          variant: 'default'
        })
      ).toBe(true)
    })
  })

  describe('getTitle', () => {
    it('should return null if seoTitle or displayTitle is missing', () => {
      expect(
        getTitle({
          journey: {
            ...defaultJourney,
            displayTitle: journey.displayTitle,
            seoTitle: journey.seoTitle
          }
        })
      ).toBeNull()
    })

    it('should return displayTitle', () => {
      expect(
        getTitle({
          journey: {
            ...defaultJourney,
            displayTitle: 'title',
            seoTitle: journey.seoTitle
          }
        })
      ).toBe('title')
    })

    it('should return null if display title is empty string', () => {
      expect(
        getTitle({
          journey: {
            ...defaultJourney,
            displayTitle: '',
            seoTitle: defaultJourney.seoTitle
          }
        })
      ).toBeNull()
    })
  })

  describe('getFooterMobileSpacing', () => {
    it('should return min height by default', () => {
      expect(
        getFooterMobileSpacing({
          journey: {
            ...defaultJourney
          }
        })
      ).toBe(MIN_HEIGHT)
    })

    it('should be website height if journey is a website', () => {
      expect(
        getFooterMobileSpacing({
          journey: {
            ...defaultJourney,
            website: true
          }
        })
      ).toBe(WEBSITE_HEIGHT)
    })

    it('should be half height if journey only has top row', () => {
      expect(
        getFooterMobileSpacing({
          journey: {
            ...defaultJourney,
            showShareButton: true
          }
        })
      ).toBe(HALF_HEIGHT)
    })

    it('should be half height if journey only has bottom row', () => {
      expect(
        getFooterMobileSpacing({
          journey: {
            ...defaultJourney,
            displayTitle: 'title'
          }
        })
      ).toBe(HALF_HEIGHT)
    })

    it('should be full height if journey has top row and bottom row', () => {
      expect(
        getFooterMobileSpacing({
          journey: {
            ...defaultJourney,
            showShareButton: true,
            displayTitle: 'title'
          }
        })
      ).toBe(FULL_HEIGHT)
    })
  })

  describe('getFooterMobileHeight', () => {
    it('should return min height by default', () => {
      expect(
        getFooterMobileHeight({
          journey: {
            ...defaultJourney
          }
        })
      ).toBe(MIN_HEIGHT)
    })

    it('should be half height if journey is a website', () => {
      expect(
        getFooterMobileHeight({
          journey: {
            ...defaultJourney,
            website: true
          }
        })
      ).toBe(HALF_HEIGHT)
    })

    it('should be half height if journey only has bottom row', () => {
      expect(
        getFooterMobileHeight({
          journey: {
            ...defaultJourney,
            displayTitle: 'title'
          }
        })
      ).toBe(HALF_HEIGHT)
    })

    it('should be min height if journey has no bottom row', () => {
      expect(
        getFooterMobileHeight({
          journey: {
            ...defaultJourney,
            showShareButton: true
          }
        })
      ).toBe(MIN_HEIGHT)
    })
  })
})
