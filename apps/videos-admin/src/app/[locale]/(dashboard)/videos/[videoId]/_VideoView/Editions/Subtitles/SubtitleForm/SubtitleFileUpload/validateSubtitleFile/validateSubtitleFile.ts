/**
 * Validates subtitle files to ensure they are of the correct type and don't duplicate existing files
 */
interface SubtitleField {
  value: File | null
}

interface ValidationError {
  code: string
  message: string
}

/**
 * Validates a subtitle file to ensure it's a valid VTT or SRT file and doesn't duplicate existing files
 * @param file The file to validate
 * @param vttField The current VTT file field from the form
 * @param srtField The current SRT file field from the form
 * @returns ValidationError object if validation fails, null if validation passes
 */
export function validateSubtitleFile(
  file: File,
  vttField: SubtitleField,
  srtField: SubtitleField
): ValidationError | null {
  // Get the file extension
  const extension = file.name.split('.').pop()?.toLowerCase()

  // Check if the file is a VTT or SRT file based on extension
  if (extension !== 'vtt' && extension !== 'srt') {
    return {
      code: 'file-invalid-type',
      message: 'File must be a VTT or SRT subtitle file'
    }
  }

  // Check if we already have a file of this type
  if (
    extension === 'vtt' &&
    vttField.value &&
    vttField.value.name !== file.name
  ) {
    return {
      code: 'file-duplicate-type',
      message: 'You already have a VTT file. Delete it first or replace it.'
    }
  }
  if (
    extension === 'srt' &&
    srtField.value &&
    srtField.value.name !== file.name
  ) {
    return {
      code: 'file-duplicate-type',
      message: 'You already have an SRT file. Delete it first or replace it.'
    }
  }
  return null
}
