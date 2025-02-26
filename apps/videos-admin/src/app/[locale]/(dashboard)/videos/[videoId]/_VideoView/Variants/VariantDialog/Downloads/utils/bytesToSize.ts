export function bytesToSize(
  bytes: number,
  binary = true,
  decimals = 2
): string {
  // const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  // if (bytes === 0) return 'n/a'

  // if (bytes < 1000) return `${bytes} ${sizes[0]}`

  // const i = Math.min(
  //   Math.floor(Math.log(bytes) / Math.log(1000)),
  //   sizes.length - 1
  // )

  // // const i = Math.min(
  // //   parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10),
  // //   sizes.length - 1
  // // )

  // return `${(bytes / 1000 ** i).toFixed(1)} ${sizes[i]}`

  if (bytes === 0) return '0 Bytes'

  const base = binary ? 1024 : 1000
  const units = binary
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes < base) {
    return `${bytes} ${bytes === 1 ? 'Byte' : 'Bytes'}`
  }

  const exp = Math.floor(Math.log(bytes) / Math.log(base))
  const value = bytes / base ** exp
  const formattedValue = value.toFixed(decimals)

  const cleanValue = parseFloat(formattedValue)

  return `${cleanValue} ${units[exp]}`
}
