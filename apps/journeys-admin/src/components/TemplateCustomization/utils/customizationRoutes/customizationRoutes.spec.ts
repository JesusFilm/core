import type { CustomizationScreen } from '../getCustomizeFlowConfig'

import {
  GUEST_ACCESSIBLE_SCREENS,
  buildCustomizeUrl,
  getActiveScreenFromQuery,
  getFirstGuestAllowedScreen,
  isScreenAllowedForGuest,
  parseScreenFromQuery
} from './customizationRoutes'

describe('customizationRoutes', () => {
  describe('buildCustomizeUrl', () => {
    it('should build URL with journeyId and screen', () => {
      expect(buildCustomizeUrl('journey-123', 'language')).toBe(
        '/templates/journey-123/customize?screen=language'
      )
      expect(buildCustomizeUrl('journey-123', 'text')).toBe(
        '/templates/journey-123/customize?screen=text'
      )
      expect(buildCustomizeUrl('journey-123', 'links')).toBe(
        '/templates/journey-123/customize?screen=links'
      )
      expect(buildCustomizeUrl('journey-123', 'social')).toBe(
        '/templates/journey-123/customize?screen=social'
      )
      expect(buildCustomizeUrl('journey-123', 'done')).toBe(
        '/templates/journey-123/customize?screen=done'
      )
    })

    it('should return /templates when journeyId is null', () => {
      expect(buildCustomizeUrl(null, 'language')).toBe('/templates')
    })

    it('should return /templates when journeyId is undefined', () => {
      expect(buildCustomizeUrl(undefined, 'language')).toBe('/templates')
    })

    it('should call onTemplatesRedirect when journeyId is null', () => {
      const onTemplatesRedirect = jest.fn()
      const result = buildCustomizeUrl(
        null,
        'language',
        undefined,
        onTemplatesRedirect
      )
      expect(result).toBe('/templates')
      expect(onTemplatesRedirect).toHaveBeenCalledTimes(1)
    })

    it('should call onTemplatesRedirect when journeyId is undefined', () => {
      const onTemplatesRedirect = jest.fn()
      const result = buildCustomizeUrl(
        undefined,
        'language',
        undefined,
        onTemplatesRedirect
      )
      expect(result).toBe('/templates')
      expect(onTemplatesRedirect).toHaveBeenCalledTimes(1)
    })

    it('should not call onTemplatesRedirect when journeyId is provided', () => {
      const onTemplatesRedirect = jest.fn()
      buildCustomizeUrl(
        'journey-123',
        'language',
        undefined,
        onTemplatesRedirect
      )
      expect(onTemplatesRedirect).not.toHaveBeenCalled()
    })

    it('with isGuest true, should never build URL for non-guest-accessible screen', () => {
      expect(buildCustomizeUrl('journey-123', 'social', true)).toBe(
        '/templates/journey-123/customize?screen=language'
      )
      expect(buildCustomizeUrl('journey-123', 'done', true)).toBe(
        '/templates/journey-123/customize?screen=language'
      )
    })

    it('with isGuest true, should build URL for guest-accessible screens unchanged', () => {
      expect(buildCustomizeUrl('journey-123', 'language', true)).toBe(
        '/templates/journey-123/customize?screen=language'
      )
      expect(buildCustomizeUrl('journey-123', 'text', true)).toBe(
        '/templates/journey-123/customize?screen=text'
      )
      expect(buildCustomizeUrl('journey-123', 'links', true)).toBe(
        '/templates/journey-123/customize?screen=links'
      )
    })

    it('without isGuest, should build URL for any screen', () => {
      expect(buildCustomizeUrl('journey-123', 'social')).toBe(
        '/templates/journey-123/customize?screen=social'
      )
      expect(buildCustomizeUrl('journey-123', 'done')).toBe(
        '/templates/journey-123/customize?screen=done'
      )
    })

    it('with isGuest false, should build URL for any screen (same as omitted)', () => {
      expect(buildCustomizeUrl('journey-123', 'social', false)).toBe(
        '/templates/journey-123/customize?screen=social'
      )
      expect(buildCustomizeUrl('journey-123', 'done', false)).toBe(
        '/templates/journey-123/customize?screen=done'
      )
    })
  })

  describe('getActiveScreenFromQuery', () => {
    const screens: CustomizationScreen[] = [
      'language',
      'text',
      'links',
      'social',
      'done'
    ]

    it('should return the screen when queryValue is a valid screen', () => {
      expect(getActiveScreenFromQuery('language', screens)).toBe('language')
      expect(getActiveScreenFromQuery('text', screens)).toBe('text')
      expect(getActiveScreenFromQuery('links', screens)).toBe('links')
      expect(getActiveScreenFromQuery('social', screens)).toBe('social')
      expect(getActiveScreenFromQuery('done', screens)).toBe('done')
    })

    it('should return first screen when queryValue is undefined', () => {
      expect(getActiveScreenFromQuery(undefined, screens)).toBe('language')
    })

    it('should return first screen when queryValue is not in screens', () => {
      expect(getActiveScreenFromQuery('invalid', screens)).toBe('language')
      expect(getActiveScreenFromQuery('', screens)).toBe('language')
    })

    it('should use first element when queryValue is an array', () => {
      expect(getActiveScreenFromQuery(['text'], screens)).toBe('text')
      expect(getActiveScreenFromQuery(['done', 'language'], screens)).toBe(
        'done'
      )
    })

    it('should return first screen when queryValue is array with invalid screen', () => {
      expect(getActiveScreenFromQuery(['invalid'], screens)).toBe('language')
    })

    it('should respect screens order for fallback', () => {
      const minimalScreens: CustomizationScreen[] = [
        'language',
        'social',
        'done'
      ]
      expect(getActiveScreenFromQuery(undefined, minimalScreens)).toBe(
        'language'
      )
      expect(getActiveScreenFromQuery('text', minimalScreens)).toBe('language')
    })
  })

  describe('guest access', () => {
    it('GUEST_ACCESSIBLE_SCREENS should be language, text, and links only', () => {
      expect([...GUEST_ACCESSIBLE_SCREENS]).toEqual([
        'language',
        'text',
        'links'
      ])
    })

    it('isScreenAllowedForGuest should return true for language, text, links', () => {
      expect(isScreenAllowedForGuest('language')).toBe(true)
      expect(isScreenAllowedForGuest('text')).toBe(true)
      expect(isScreenAllowedForGuest('links')).toBe(true)
    })

    it('isScreenAllowedForGuest should return false for social and done', () => {
      expect(isScreenAllowedForGuest('social')).toBe(false)
      expect(isScreenAllowedForGuest('done')).toBe(false)
    })

    it('getFirstGuestAllowedScreen should return language', () => {
      expect(getFirstGuestAllowedScreen()).toBe('language')
    })
  })

  describe('parseScreenFromQuery', () => {
    it('should return string when queryValue is a string', () => {
      expect(parseScreenFromQuery('language')).toBe('language')
      expect(parseScreenFromQuery('text')).toBe('text')
    })

    it('should return undefined when queryValue is undefined or null', () => {
      expect(parseScreenFromQuery(undefined)).toBeUndefined()
      expect(parseScreenFromQuery(null)).toBeUndefined()
    })

    it('should return undefined when queryValue is empty string', () => {
      expect(parseScreenFromQuery('')).toBeUndefined()
    })

    it('should return first element when queryValue is an array', () => {
      expect(parseScreenFromQuery(['links'])).toBe('links')
      expect(parseScreenFromQuery(['social', 'done'])).toBe('social')
    })

    it('should return undefined when queryValue is array with empty string', () => {
      expect(parseScreenFromQuery([''])).toBeUndefined()
    })
  })
})
