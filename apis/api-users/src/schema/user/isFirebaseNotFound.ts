export function isFirebaseNotFound(error: unknown): boolean {
  return (
    error != null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: string }).code === 'auth/user-not-found'
  )
}
