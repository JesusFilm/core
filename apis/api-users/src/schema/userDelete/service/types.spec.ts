import { createLog } from './types'

describe('createLog', () => {
  it('should create a log entry with default info level', () => {
    const log = createLog('test message')
    expect(log.message).toBe('test message')
    expect(log.level).toBe('info')
    expect(log.timestamp).toBeDefined()
  })

  it('should create a log entry with explicit level', () => {
    const log = createLog('error occurred', 'error')
    expect(log.level).toBe('error')
  })

  it('should create a log entry with warn level', () => {
    const log = createLog('something off', 'warn')
    expect(log.level).toBe('warn')
  })

  it('should set a valid ISO timestamp', () => {
    const before = new Date().toISOString()
    const log = createLog('test')
    const after = new Date().toISOString()
    expect(log.timestamp >= before).toBe(true)
    expect(log.timestamp <= after).toBe(true)
  })
})
