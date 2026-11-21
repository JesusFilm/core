import pino from 'pino'

import { registerShutdown } from './shutdown'

function captureSignals(
  shutdown: () => Promise<void>,
  logger = pino({ enabled: false })
) {
  const signals = new Map<string | symbol, (...args: unknown[]) => void>()
  const on = vi.spyOn(process, 'on').mockImplementation((event, listener) => {
    signals.set(event, listener)
    return process
  })
  registerShutdown(shutdown, logger)
  on.mockRestore()
  return signals
}

describe('process signal shutdown', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each(['SIGTERM', 'SIGINT'])(
    'waits for drain and log flushing before exit, ignoring repeated %s signals',
    async (signal) => {
      let completeDrain!: () => void
      const shutdown = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            completeDrain = resolve
          })
      )
      const logger = pino({ enabled: false })
      let completeFlush!: () => void
      const flush = vi.spyOn(logger, 'flush').mockImplementation((callback) => {
        completeFlush = () => callback?.()
      })
      const exit = vi
        .spyOn(process, 'exit')
        .mockImplementation(vi.fn<typeof process.exit>())
      const signals = captureSignals(shutdown, logger)

      signals.get(signal)!()
      signals.get('SIGINT')!()
      signals.get('SIGTERM')!()
      expect(shutdown).toHaveBeenCalledTimes(1)
      expect(flush).not.toHaveBeenCalled()
      expect(exit).not.toHaveBeenCalled()

      completeDrain()
      await vi.waitFor(() => expect(flush).toHaveBeenCalledTimes(1))
      expect(exit).not.toHaveBeenCalled()
      completeFlush()
      expect(exit).toHaveBeenCalledExactlyOnceWith(0)
    }
  )

  it('exits unsuccessfully after a failed drain and logs only the fixed event', async () => {
    const logger = pino({ enabled: false })
    const error = vi.spyOn(logger, 'error')
    const exit = vi
      .spyOn(process, 'exit')
      .mockImplementation(vi.fn<typeof process.exit>())
    const signals = captureSignals(async () => {
      throw new Error('private backend detail')
    }, logger)

    signals.get('SIGTERM')!()
    await vi.waitFor(() => expect(exit).toHaveBeenCalledExactlyOnceWith(1))
    expect(error).toHaveBeenCalledExactlyOnceWith({ event: 'shutdown_failed' })
  })
})
