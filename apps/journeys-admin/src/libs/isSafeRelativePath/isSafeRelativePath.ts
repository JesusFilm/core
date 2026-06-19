export function isSafeRelativePath(path: string | undefined): path is string {
  if (path == null) return false
  if (!path.startsWith('/')) return false
  // very basic check to avoid protocol-relative or absolute URLs
  if (path.startsWith('//')) return false
  return true
}
