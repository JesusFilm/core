import { toastManager } from '@/components/ui/toast'

export type NotifyVariant = 'success' | 'error' | 'info' | 'warning'

/** One-line notification; the single place the app talks to the toast manager. */
export function notify(
  message: string,
  variant: NotifyVariant = 'info',
  description?: string
): void {
  toastManager.add({ title: message, description, type: variant })
}

export function notifyError(error: unknown, fallback: string): void {
  notify(error instanceof Error ? error.message : fallback, 'error')
}
