import { normalizeLanguage } from './normalizeLanguage'

describe('normalizeLanguage', () => {
  it('should normalise empty language name', () => {
    expect(normalizeLanguage('')).toBe('')
  })

  it('should normalise french language name', () => {
    expect(normalizeLanguage('French')).toBe('french')
  })

  it('should normalise spanish language name', () => {
    expect(normalizeLanguage('Spanish, Latin American')).toBe('spanish')
  })

  it('should normalise quecha language name', () => {
    expect(
      normalizeLanguage('Quechua, Huanuco, Huamalies-Northern Dos De Mayo')
    ).toBe('quechua')
  })
})
