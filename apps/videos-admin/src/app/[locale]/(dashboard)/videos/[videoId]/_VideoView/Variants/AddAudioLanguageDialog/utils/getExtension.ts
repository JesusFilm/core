export function getExtension(fileName: string): string | null {
  // Handle single dot case
  if (fileName === '.') return null

  if (!fileName?.length) return null
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return null
  const extension = fileName.slice(lastDotIndex)
  return `${extension.toLowerCase()}`
}
