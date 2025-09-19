export function toUserMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  try {
    return JSON.stringify(error)
  } catch {
    return 'Unexpected error'
  }
}

export function reportError(error: unknown, context?: string) {
  const message = toUserMessage(error)
  const details = context ? `${context}: ${message}` : message
  console.error(details)
  return details
}
