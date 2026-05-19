/** Best-effort message for logs and Slack from thrown values. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim()
  }

  try {
    const stringified = JSON.stringify(error)
    if (typeof stringified === 'string') {
      return stringified
    }
    return String(error)
  } catch {
    return String(error)
  }
}
