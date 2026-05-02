/** Best-effort message for logs and Slack from thrown values. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim()
  }

  try {
    const result = JSON.stringify(error)
    return result ?? String(error)
  } catch {
    return String(error)
  }
}
