import { warnOnInvalidJourneysUrl } from './warnOnInvalidJourneysUrl'

describe('warnOnInvalidJourneysUrl', () => {
  const log = { warn: vi.fn() }

  beforeEach(() => {
    log.warn.mockClear()
  })

  it.each([
    ['relative', '/journeys'],
    ['scheme-less', 'your.nextstep.is'],
    ['non-http', 'ftp://your.nextstep.is']
  ])('logs one warning for a %s value and carries on', (_kind, value) => {
    expect(() => warnOnInvalidJourneysUrl(value, log)).not.toThrow()

    expect(log.warn).toHaveBeenCalledTimes(1)
    expect(log.warn).toHaveBeenCalledWith(
      { module: 'env', JOURNEYS_URL: value },
      expect.stringContaining('JOURNEYS_URL')
    )
  })

  it.each(['https://your.nextstep.is', 'http://localhost:4100'])(
    'logs nothing for %s',
    (value) => {
      warnOnInvalidJourneysUrl(value, log)

      expect(log.warn).not.toHaveBeenCalled()
    }
  )
})
