export interface LogEntry {
  message: string
  level: 'info' | 'warn' | 'error'
  timestamp: string
}

export function createLog(
  message: string,
  level: 'info' | 'warn' | 'error' = 'info'
): LogEntry {
  return { message, level, timestamp: new Date().toISOString() }
}
