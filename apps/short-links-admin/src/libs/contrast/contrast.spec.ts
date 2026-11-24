import {
  contrastRatio,
  hasLowQrContrast,
  normalizeHexColor,
  relativeLuminance
} from './contrast'

describe('normalizeHexColor', () => {
  it('expands short hex and lower-cases', () => {
    expect(normalizeHexColor('#FFF')).toBe('#ffffff')
    expect(normalizeHexColor('abc')).toBe('#aabbcc')
    expect(normalizeHexColor(' #123456 ')).toBe('#123456')
  })

  it('rejects invalid colours', () => {
    expect(normalizeHexColor('red')).toBeUndefined()
    expect(normalizeHexColor('#12345')).toBeUndefined()
    expect(normalizeHexColor('')).toBeUndefined()
  })
})

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 3)
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 3)
  })

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5)
  })

  it('is undefined for invalid colours', () => {
    expect(contrastRatio('nope', '#ffffff')).toBeUndefined()
  })
})

describe('hasLowQrContrast', () => {
  it('warns below 3:1', () => {
    expect(hasLowQrContrast('#777777', '#999999')).toBe(true)
    expect(hasLowQrContrast('#000000', '#ffffff')).toBe(false)
  })

  it('does not warn when a colour is invalid', () => {
    expect(hasLowQrContrast('', '#ffffff')).toBe(false)
  })
})
