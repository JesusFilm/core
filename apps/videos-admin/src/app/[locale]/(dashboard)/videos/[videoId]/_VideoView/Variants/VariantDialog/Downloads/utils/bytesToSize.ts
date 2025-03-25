export function bytesToSize(
  bytes: number,
  binary = true,
  decimals = 2
): string {
  if (bytes === 0) return '0 Bytes'

  const base = binary ? 1024 : 1000
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes < base) {
    return `${bytes} ${bytes === 1 ? 'Byte' : 'Bytes'}`
  }

  const exp = Math.floor(Math.log(bytes) / Math.log(base))
  const value = bytes / base ** exp
  const formattedValue = value.toFixed(decimals)

  const cleanValue = parseFloat(formattedValue)

  return `${cleanValue} ${units[exp]}`
}
