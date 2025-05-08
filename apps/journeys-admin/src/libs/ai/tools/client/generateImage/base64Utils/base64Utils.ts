/**
 * Pure JavaScript implementation of base64 decoding to Uint8Array, compatible with Edge runtime.
 * Does not rely on atob() or Buffer.
 *
 * @param base64 - Base64 string to decode
 * @returns Uint8Array of decoded data
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // Base64 character set. Maps index to base64 character
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  // Create lookup table for base64 characters to their 6-bit value
  const lookup: Record<string, number> = {}
  for (let i = 0; i < chars.length; i++) {
    lookup[chars[i]] = i
  }

  // Handle URL-safe format: convert - to + and _ to /
  let cleanBase64 = base64.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if necessary
  const paddingLength = (4 - (cleanBase64.length % 4)) % 4
  cleanBase64 += '='.repeat(paddingLength)

  // Calculate output length
  const outputLength =
    Math.floor((cleanBase64.length * 3) / 4) -
    (cleanBase64.endsWith('==') ? 2 : cleanBase64.endsWith('=') ? 1 : 0)

  // Create output array
  const result = new Uint8Array(outputLength)

  // Process the base64 string in groups of 4 characters (24 bits, 3 bytes)
  let outputIndex = 0
  for (let i = 0; i < cleanBase64.length; i += 4) {
    // Convert four base64 characters into three bytes

    // Get four 6-bit values
    const values: number[] = []
    for (let j = 0; j < 4; j++) {
      const char = cleanBase64[i + j]
      values[j] = char === '=' ? 0 : lookup[char]
    }

    // Combine the 6-bit values into three bytes (3 * 8 bits)
    const byte1 = (values[0] << 2) | (values[1] >> 4)
    const byte2 = ((values[1] & 0xf) << 4) | (values[2] >> 2)
    const byte3 = ((values[2] & 0x3) << 6) | values[3]

    // Add to output array
    result[outputIndex++] = byte1

    // Only add byte2 if it's not padding
    if (cleanBase64[i + 2] !== '=') {
      result[outputIndex++] = byte2
    }

    // Only add byte3 if it's not padding
    if (cleanBase64[i + 3] !== '=') {
      result[outputIndex++] = byte3
    }
  }

  return result
}
