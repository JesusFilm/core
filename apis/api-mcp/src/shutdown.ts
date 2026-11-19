import { type Logger } from 'pino'

/** Ending this transport process does not cancel an owning backend operation. */
export function registerShutdown(
  shutdown: () => Promise<void>,
  logger: Logger
): void {
  let stopping = false
  const exit = (code: number) => {
    logger.flush(() => process.exit(code))
  }
  const stop = () => {
    if (stopping) return
    stopping = true
    void shutdown().then(
      () => exit(0),
      () => {
        logger.error({ event: 'shutdown_failed' })
        exit(1)
      }
    )
  }
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}
