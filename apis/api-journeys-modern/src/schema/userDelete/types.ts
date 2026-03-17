export interface LogEntry {
  message: string
  level: string
  timestamp: string
}

export function createLog(message: string, level = 'info'): LogEntry {
  return { message, level, timestamp: new Date().toISOString() }
}
