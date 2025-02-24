export function getExtension(fileName: string): string | null {
  const [, extension] = fileName.split('.')
  if (extension == null) return null
  return `.${extension.toLowerCase()}`
}
