export type { LogLevel, LogEntry } from '@core/shared/user-delete'
export { createLog } from '@core/shared/user-delete'

export function isFirebaseNotFound(error: unknown): boolean {
  return (
    error != null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'auth/user-not-found'
  )
}

export function isFirebaseNotFound(error: unknown): boolean {
  return (
    error != null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'auth/user-not-found'
  )
}
