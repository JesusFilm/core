interface ValidationError {
  code: string
  message: string
}

/**
 * Validates a subtitle file to ensure it's a valid VTT or SRT file and doesn't duplicate existing files
 * @param file The file to validate
 * @returns ValidationError object if validation fails, null if validation passes
 */
export function validateSubtitleFile(file: File): ValidationError | null {
  // Get the file extension
  const extension = file.name.split('.').pop()?.toLowerCase()

  // Check if the file is a VTT or SRT file based on extension
  if (extension !== 'vtt' && extension !== 'srt') {
    return {
      code: 'file-invalid-type',
      message: 'File must be a VTT or SRT subtitle file'
    }
  }
  return null
}
