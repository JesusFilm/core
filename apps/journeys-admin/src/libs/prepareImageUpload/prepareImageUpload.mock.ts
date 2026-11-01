// The leading bytes of each format — enough for upload validation to accept
// a test file as a real image.
export const PNG_FILE_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
])
export const JPEG_FILE_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
