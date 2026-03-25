// Nitpick: extracted into a named type to avoid repeating the union
export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  message: string
  level: LogLevel
  timestamp: string
}

export function createLog(
  message: string,
  level: LogLevel = 'info'
): LogEntry {
  return { message, level, timestamp: new Date().toISOString() }
}
