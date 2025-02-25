import { getExtension } from './getExtension'

describe('getExtension', () => {
  it('should return lowercase extension with dot for valid filename', () => {
    expect(getExtension('test.JPG')).toBe('.jpg')
    expect(getExtension('test.PNG')).toBe('.png')
    expect(getExtension('test.JPEG')).toBe('.jpeg')
  })

  it('should handle filenames with multiple dots', () => {
    expect(getExtension('test.min.js')).toBe('.js')
    expect(getExtension('my.file.name.txt')).toBe('.txt')
  })

  it('should return null for invalid inputs', () => {
    expect(getExtension('')).toBeNull()
    expect(getExtension('filename')).toBeNull()
    expect(getExtension(undefined as unknown as string)).toBeNull()
  })
})
