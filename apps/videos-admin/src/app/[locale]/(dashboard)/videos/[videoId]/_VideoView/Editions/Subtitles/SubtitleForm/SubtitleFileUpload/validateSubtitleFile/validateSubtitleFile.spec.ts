import { validateSubtitleFile } from './validateSubtitleFile'

describe('validateSubtitleFile', () => {
  const createFile = (name: string): File => {
    return new File(['test content'], name, { type: 'text/plain' })
  }

  const emptyField = { value: null }
  const vttField = { value: createFile('existing.vtt') }
  const srtField = { value: createFile('existing.srt') }

  it('should return null for valid VTT file when no VTT file exists', () => {
    const file = createFile('test.vtt')
    const result = validateSubtitleFile(file, emptyField, emptyField)
    expect(result).toBeNull()
  })

  it('should return null for valid SRT file when no SRT file exists', () => {
    const file = createFile('test.srt')
    const result = validateSubtitleFile(file, emptyField, emptyField)
    expect(result).toBeNull()
  })

  it('should handle files with no extension', () => {
    const file = createFile('test')
    const result = validateSubtitleFile(file, emptyField, emptyField)
    expect(result).toEqual({
      code: 'file-invalid-type',
      message: 'File must be a VTT or SRT subtitle file'
    })
  })

  it('should return error for invalid file type', () => {
    const file = createFile('test.mp4')
    const result = validateSubtitleFile(file, emptyField, emptyField)
    expect(result).toEqual({
      code: 'file-invalid-type',
      message: 'File must be a VTT or SRT subtitle file'
    })
  })

  it('should return error when trying to add a VTT file when one already exists', () => {
    const file = createFile('new.vtt')
    const result = validateSubtitleFile(file, vttField, emptyField)
    expect(result).toEqual({
      code: 'file-duplicate-type',
      message: 'You already have a VTT file. Delete it first or replace it.'
    })
  })

  it('should return error when trying to add an SRT file when one already exists', () => {
    const file = createFile('new.srt')
    const result = validateSubtitleFile(file, emptyField, srtField)
    expect(result).toEqual({
      code: 'file-duplicate-type',
      message: 'You already have an SRT file. Delete it first or replace it.'
    })
  })

  it('should allow replacing an existing VTT file with the same filename', () => {
    const file = createFile('existing.vtt')
    const result = validateSubtitleFile(file, vttField, emptyField)
    expect(result).toBeNull()
  })

  it('should allow replacing an existing SRT file with the same filename', () => {
    const file = createFile('existing.srt')
    const result = validateSubtitleFile(file, emptyField, srtField)
    expect(result).toBeNull()
  })

  it('should handle uppercase file extensions', () => {
    const file = createFile('test.VTT')
    const result = validateSubtitleFile(file, emptyField, emptyField)
    expect(result).toBeNull()
  })

  it('should handle files with multiple dots in the name', () => {
    const file = createFile('test.subtitle.vtt')
    const result = validateSubtitleFile(file, emptyField, emptyField)
    expect(result).toBeNull()
  })
})
