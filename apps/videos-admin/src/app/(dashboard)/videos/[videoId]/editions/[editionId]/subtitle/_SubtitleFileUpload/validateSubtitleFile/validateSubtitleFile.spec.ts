import { validateSubtitleFile } from './validateSubtitleFile'

describe('validateSubtitleFile', () => {
  const createFile = (name: string): File => {
    return new File(['test content'], name, { type: 'text/plain' })
  }

  it('should return null for valid VTT file when no VTT file exists', () => {
    const file = createFile('test.vtt')
    const result = validateSubtitleFile(file)
    expect(result).toBeNull()
  })

  it('should return null for valid SRT file when no SRT file exists', () => {
    const file = createFile('test.srt')
    const result = validateSubtitleFile(file)
    expect(result).toBeNull()
  })

  it('should handle files with no extension', () => {
    const file = createFile('test')
    const result = validateSubtitleFile(file)
    expect(result).toEqual({
      code: 'file-invalid-type',
      message: 'File must be a VTT or SRT subtitle file'
    })
  })

  it('should return error for invalid file type', () => {
    const file = createFile('test.mp4')
    const result = validateSubtitleFile(file)
    expect(result).toEqual({
      code: 'file-invalid-type',
      message: 'File must be a VTT or SRT subtitle file'
    })
  })

  it('should allow replacing an existing VTT file with the same filename', () => {
    const file = createFile('existing.vtt')
    const result = validateSubtitleFile(file)
    expect(result).toBeNull()
  })

  it('should allow replacing an existing SRT file with the same filename', () => {
    const file = createFile('existing.srt')
    const result = validateSubtitleFile(file)
    expect(result).toBeNull()
  })

  it('should handle uppercase file extensions', () => {
    const file = createFile('test.VTT')
    const result = validateSubtitleFile(file)
    expect(result).toBeNull()
  })

  it('should handle files with multiple dots in the name', () => {
    const file = createFile('test.subtitle.vtt')
    const result = validateSubtitleFile(file)
    expect(result).toBeNull()
  })
})
