import { defaultJourney } from '../../../TemplateView/data'
import { journey } from '../../../TemplateView/TemplateFooter/data'

import {
  FULL_HEIGHT,
  HALF_HEIGHT,
  MIN_HEIGHT,
  WEBSITE_HEIGHT,
  combinedFooter,
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
    it('should return false by default', () => {
      expect(hasHostDetails({ journey: defaultJourney })).toBe(false)
    })

    it('should return true if there is a host', () => {
      expect(
        hasHostDetails({
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
    it('should return null if there is no seoTitle or displayTitle', () => {
      expect(
        getTitle({
          journey: {
            ...defaultJourney,
            displayTitle: null,
            seoTitle: null
          }
        })
      ).toBeNull()
    })

    it('should return seoTitle', () => {
      expect(
        getTitle({
          journey: {
            ...defaultJourney,
            displayTitle: null,
            seoTitle: 'seoTitle'
          }
        })
      ).toBe('seoTitle')
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

  describe('combinedFooter', () => {
    it('should return true if reactions can be combined with chat buttons', () => {
      expect(
        combinedFooter({
          journey: {
            ...defaultJourney,
            seoTitle: null,
            displayTitle: '',
            host: null,
            showShareButton: true
          }
        })
      ).toBe(true)
    })

    it('should return false on admin', () => {
      expect(
        combinedFooter({
          journey: {
            ...defaultJourney,
            showShareButton: true
          },
          variant: 'admin'
        })
      ).toBe(false)
    })
  })

  describe('getFooterMobileSpacing', () => {
    it('should return min height by default', () => {
      expect(
        getFooterMobileSpacing({
          journey: {
            ...defaultJourney,
            seoTitle: null,
            displayTitle: '',
            host: null,
            chatButtons: [],
            showShareButton: null,
            showLikeButton: null,
            showDislikeButton: null
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
            showLikeButton: true,
            showDislikeButton: true,
            displayTitle: 'title',
            host: {
              id: 'hostId',
              src1: 'someimageurl',
              src2: null,
              __typename: 'Host',
              teamId: 'teamId',
              title: 'Johnathan Joestar',
              location: 'England'
            },
            chatButtons: [
              {
                __typename: 'ChatButton',
                id: 'chatButtonId',
                link: null,
                platform: null
              }
            ]
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
            showShareButton: true,
            showLikeButton: true,
            showDislikeButton: true,
            displayTitle: 'title',
            host: {
              id: 'hostId',
              src1: 'someimageurl',
              src2: null,
              __typename: 'Host',
              teamId: 'teamId',
              title: 'Johnathan Joestar',
              location: 'England'
            },
            chatButtons: [
              {
                __typename: 'ChatButton',
                id: 'chatButtonId',
                link: null,
                platform: null
              }
            ]
          }
        })
      ).toBe(HALF_HEIGHT)
    })

    it('should be min height if journey has no bottom row', () => {
      expect(
        getFooterMobileHeight({
          journey: {
            ...defaultJourney
          }
        })
      ).toBe(MIN_HEIGHT)
    })
  })
})
