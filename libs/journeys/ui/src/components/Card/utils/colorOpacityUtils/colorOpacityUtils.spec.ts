import {
  addAlphaToHex,
  getOpacityFromHex,
  isValidHex,
  reduceHexOpacity,
  stripAlphaFromHex
} from './colorOpacityUtils'

describe('colorOpacityUtils', () => {
  describe('isValidHex', () => {
    it('should return true for valid 6-digit hex codes', () => {
      expect(isValidHex('#FF0000')).toBe(true)
    })

    it('should return true for valid 8-digit hex codes', () => {
      expect(isValidHex('#FF0000FF')).toBe(true)
    })

    it('should return false for invalid hex codes', () => {
      expect(isValidHex('FF0000')).toBe(false) // missing #
      expect(isValidHex('#FF00')).toBe(false) // too short
      expect(isValidHex('#FF000')).toBe(false) // wrong length
      expect(isValidHex('#FF0000F')).toBe(false) // wrong length
      expect(isValidHex('#FXFFFF')).toBe(false) // invalid character
      expect(isValidHex('not-a-hex')).toBe(false)
      expect(isValidHex('')).toBe(false)
    })
  })

  describe('getOpacityFromHex', () => {
    it('should return 30 for 6-digit hex codes by default', () => {
      expect(getOpacityFromHex('#FF0000')).toBe(30)
      expect(getOpacityFromHex('#00FF00')).toBe(30)
      expect(getOpacityFromHex('#0000FF')).toBe(30)
    })

    it('should calculate correct opacity percentage for 8-digit hex codes', () => {
      expect(getOpacityFromHex('#FF0000FF')).toBe(100) // 100% opacity
      expect(getOpacityFromHex('#00FF0080')).toBe(50) // 50% opacity
      expect(getOpacityFromHex('#0000FF40')).toBe(25) // 25% opacity
      expect(getOpacityFromHex('#12345600')).toBe(0) // 0% opacity
    })

    it('should return undefined for invalid hex codes', () => {
      expect(getOpacityFromHex('not-a-hex')).toBeUndefined()
      expect(getOpacityFromHex('#FF00')).toBeUndefined()
      expect(getOpacityFromHex('')).toBeUndefined()
    })
  })

  describe('stripAlphaFromHex', () => {
    it('should return the original 6-digit hex code unchanged', () => {
      expect(stripAlphaFromHex('#FF0000')).toBe('#FF0000')
      expect(stripAlphaFromHex('#00FF00')).toBe('#00FF00')
      expect(stripAlphaFromHex('#0000FF')).toBe('#0000FF')
    })

    it('should remove alpha channel from 8-digit hex codes', () => {
      expect(stripAlphaFromHex('#FF0000FF')).toBe('#FF0000')
      expect(stripAlphaFromHex('#00FF0080')).toBe('#00FF00')
      expect(stripAlphaFromHex('#0000FF40')).toBe('#0000FF')
      expect(stripAlphaFromHex('#12345678')).toBe('#123456')
    })

    it('should return the original string for invalid hex codes', () => {
      const invalidHex = 'not-a-hex'
      expect(stripAlphaFromHex(invalidHex)).toBe(invalidHex)

      const shortHex = '#FF00'
      expect(stripAlphaFromHex(shortHex)).toBe(shortHex)
    })
  })

  describe('addAlphaToHex', () => {
    it('should add alpha channel to 6-digit hex codes based on opacity percentage', () => {
      expect(addAlphaToHex('#FF0000', 100)).toBe('#FF0000FF') // 100% opacity
      expect(addAlphaToHex('#00FF00', 50)).toBe('#00FF0080') // 50% opacity
      expect(addAlphaToHex('#0000FF', 25)).toBe('#0000FF40') // 25% opacity
      expect(addAlphaToHex('#123456', 0)).toBe('#12345600') // 0% opacity
    })

    it('should replace existing alpha channel in 8-digit hex codes', () => {
      expect(addAlphaToHex('#FF0000AA', 50)).toBe('#FF000080')
      expect(addAlphaToHex('#00FF0033', 75)).toBe('#00FF00BF')
    })

    it('should clamp opacity percentage between 0 and 100', () => {
      expect(addAlphaToHex('#FF0000', 150)).toBe('#FF0000FF') // Clamp to 100%
      expect(addAlphaToHex('#00FF00', -25)).toBe('#00FF0000') // Clamp to 0%
    })

    it('should handle edge cases correctly', () => {
      // Exact boundaries
      expect(addAlphaToHex('#FF0000', 0)).toBe('#FF000000')
      expect(addAlphaToHex('#FF0000', 100)).toBe('#FF0000FF')

      // Decimal values should round correctly
      expect(addAlphaToHex('#FF0000', 33.33)).toBe('#FF000055') // ~33.33% -> decimal 85 -> hex 55
    })
  })

  describe('reduceHexOpacity', () => {
    it('should reduce the opacity of a hex color by a specified percentage', () => {
      expect(reduceHexOpacity('#FFFFFF', 50)).toBe('#FFFFFF00')
      expect(reduceHexOpacity('#00FF0080', 25)).toBe('#00FF0040')
      expect(reduceHexOpacity('#0000FFFF', 100)).toBe('#0000FF00')
    })

    it('should return the 00 alpha hex code if the opacity is already 0', () => {
      expect(reduceHexOpacity('#FF000000', 50)).toBe('#FF000000')
    })
  })
})
