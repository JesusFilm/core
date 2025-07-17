import { getExtension } from './getExtension'

describe('getExtension', () => {
  it('should return lowercase file extension with dot for valid filename', () => {
    expect(getExtension('test.mp4')).toBe('.mp4')
    expect(getExtension('video.MP4')).toBe('.mp4')
    expect(getExtension('myfile.PDF')).toBe('.pdf')
  })

  it('should handle filenames with multiple dots', () => {
    expect(getExtension('my.awesome.video.mp4')).toBe('.mp4')
    expect(getExtension('backup.2024.03.21.txt')).toBe('.txt')
  })

  it('should return null for filenames without extension', () => {
    expect(getExtension('testfile')).toBeNull()
    expect(getExtension('noextension')).toBeNull()
  })

  it('should return null for empty or invalid input', () => {
    expect(getExtension('')).toBeNull()
    expect(getExtension('.')).toBeNull()
    expect(getExtension(undefined as unknown as string)).toBeNull()
  })
})
