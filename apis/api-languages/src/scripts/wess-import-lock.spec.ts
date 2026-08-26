import { prismaMock } from '../../test/prismaMock'

import {
  WessImportInProgressError,
  withWessImportLock
} from './wess-import-lock'

describe('withWessImportLock', () => {
  let lockHeld = false

  beforeEach(() => {
    lockHeld = false
    prismaMock.$transaction.mockImplementation(async (fn) => {
      const tx = {
        $queryRaw: vi.fn().mockImplementation(async () => {
          if (lockHeld) {
            return [{ pg_try_advisory_lock: false }]
          }
          lockHeld = true
          return [{ pg_try_advisory_lock: true }]
        }),
        $executeRaw: vi.fn().mockImplementation(async () => {
          lockHeld = false
          return 1
        })
      }
      return fn(tx as never)
    })
  })

  it('runs the callback when the advisory lock is acquired', async () => {
    const result = await withWessImportLock(async () => 'ok')

    expect(result).toBe('ok')
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
  })

  it('throws when another import already holds the advisory lock', async () => {
    lockHeld = true

    await expect(withWessImportLock(async () => 'ok')).rejects.toBeInstanceOf(
      WessImportInProgressError
    )
  })

  it('releases the advisory lock when the callback throws', async () => {
    await expect(
      withWessImportLock(async () => {
        throw new Error('import failed')
      })
    ).rejects.toThrow('import failed')

    lockHeld = false
    await expect(withWessImportLock(async () => 'retry')).resolves.toBe('retry')
  })
})
