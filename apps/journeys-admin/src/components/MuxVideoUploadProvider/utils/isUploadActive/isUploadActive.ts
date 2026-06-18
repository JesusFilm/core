import type { UploadTask } from '../types'

/**
 * An upload task is "active" while it is still in flight — i.e. waiting in the
 * queue, uploading bytes, or processing on Mux. Used to drive the uploading
 * skeleton tile and the "cancel in progress upload" messaging.
 */
export function isUploadActive(task: UploadTask | null): boolean {
  if (task == null) return false
  return (
    task.status === 'uploading' ||
    task.status === 'processing' ||
    task.status === 'waiting'
  )
}
