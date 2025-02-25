export function getExtension(fileName: string): string | null {
  if (!fileName?.length) return null
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return null
  const extension = fileName.slice(lastDotIndex)
  return `${extension.toLowerCase()}`
}
