import { vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import { logger } from '../logger'

import {
  CampaignWrite,
  CampaignWriteDeclaration,
  campaignWrite
} from './campaignWrite'

/** What the fake transaction saw, in order: one name per statement or event. */
let events: string[]
/** The values each lock statement was given, in the order of `events`. */
let lockValues: unknown[][]
let commitFails: boolean

/** Name a raw lock statement by its table and whether it takes all rows or some. */
function lockName(sql: readonly string[]): string {
  const statement = sql.join('?')
  const table = statement.match(/FROM "(\w+)"/)?.[1] ?? 'unknown'
  if (statement.includes('ANY(')) return `${table} by id`
  if (statement.includes('"campaignId" =')) return `every ${table}`
  return table
}

/** A transaction client that records its calls instead of running them. */
const fakeTx = {
  $executeRaw: vi.fn(async (sql: readonly string[], ...values: unknown[]) => {
    events.push(
      sql.join('?').includes('pg_advisory_xact_lock') ? 'structure' : 'execute'
    )
    lockValues.push(values)
    return 0
  }),
  $queryRaw: vi.fn(async (sql: readonly string[], ...values: unknown[]) => {
    events.push(lockName(sql))
    lockValues.push(values)
    return []
  }),
  campaign: {
    update: vi.fn(async () => {
      events.push('touch')
      return {}
    })
  }
}

async function write<T>(
  declaration: CampaignWriteDeclaration,
  body: (write: CampaignWrite) => Promise<T> = async () =>
    undefined as unknown as T,
  options?: { timeout?: number }
): Promise<T> {
  return await campaignWrite('campaignId', declaration, body, options)
}

/** The statements of a write, without the body's own events. */
function locks(): string[] {
  return events.filter((event) => event !== 'touch' && event !== 'commit')
}

describe('campaignWrite', () => {
  beforeEach(() => {
    events = []
    lockValues = []
    commitFails = false
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation((async (
      callback: (tx: typeof fakeTx) => Promise<unknown>
    ) => {
      const result = await callback(fakeTx)
      events.push('commit')
      if (commitFails) throw new Error('commit failed')
      return result
    }) as never)
  })

  describe('declaration kinds alone', () => {
    it('structure takes the advisory lock on campaign:<id>', async () => {
      await write({ structure: true })

      expect(locks()).toEqual(['structure'])
      expect(lockValues[0]).toEqual(['campaign:campaignId'])
    })

    it('textRows locks every block, region and string row of the campaign', async () => {
      await write({ textRows: true })

      expect(locks()).toEqual([
        'every CampaignBlock',
        'every CampaignRegion',
        'every CampaignString'
      ])
      expect(lockValues.slice(0, 3)).toEqual([
        ['campaignId'],
        ['campaignId'],
        ['campaignId']
      ])
    })

    it('targets lock their rows by kind and id, blocks then regions then strings', async () => {
      await write({
        targets: [
          { kind: 'string', id: 'stringId' },
          { kind: 'block', id: 'blockB' },
          { kind: 'region', id: 'regionId' },
          { kind: 'block', id: 'blockA' },
          { kind: 'block', id: 'blockB' }
        ]
      })

      expect(locks()).toEqual([
        'CampaignBlock by id',
        'CampaignRegion by id',
        'CampaignString by id'
      ])
      expect(lockValues.slice(0, 3)).toEqual([
        [['blockB', 'blockA']],
        [['regionId']],
        [['stringId']]
      ])
    })

    it('a campaign target is the Campaign row', async () => {
      await write({ targets: [{ kind: 'campaign', id: 'campaignId' }] })

      expect(locks()).toEqual(['Campaign'])
      expect(lockValues[0]).toEqual(['campaignId'])
    })

    it('refuses a campaign target of another campaign before any lock', async () => {
      await expect(
        write({ targets: [{ kind: 'campaign', id: 'otherId' }] })
      ).rejects.toThrow('a campaign target must be the campaign being written')
      expect(events).toEqual([])
    })

    it('languageRows locks every language row of the campaign', async () => {
      await write({ languageRows: true })

      expect(locks()).toEqual(['every CampaignLanguage'])
    })

    it('shareLanguage locks one Share Language row', async () => {
      await write({ shareLanguage: 'regionLanguageId' })

      expect(locks()).toEqual(['CampaignRegionLanguage'])
      expect(lockValues[0]).toEqual(['regionLanguageId'])
    })

    it('campaignRow locks the Campaign row', async () => {
      await write({ campaignRow: true })

      expect(locks()).toEqual(['Campaign'])
    })

    it('an empty declaration takes no lock', async () => {
      await write({})

      expect(locks()).toEqual([])
    })
  })

  describe('combinations the callers use, in protocol order', () => {
    it.each<[string, CampaignWriteDeclaration, string[]]>([
      [
        'structure + text rows (region delete)',
        { structure: true, textRows: true },
        [
          'structure',
          'every CampaignBlock',
          'every CampaignRegion',
          'every CampaignString'
        ]
      ],
      [
        'structure + Share Language (Share Language delete)',
        { shareLanguage: 'regionLanguageId', structure: true },
        ['structure', 'CampaignRegionLanguage']
      ],
      [
        'text rows + Campaign row (default-language swap)',
        { campaignRow: true, textRows: true },
        [
          'every CampaignBlock',
          'every CampaignRegion',
          'every CampaignString',
          'Campaign'
        ]
      ],
      [
        'targets + Campaign row (translation writes)',
        {
          campaignRow: true,
          targets: [
            { kind: 'region', id: 'regionId' },
            { kind: 'block', id: 'blockId' }
          ]
        },
        ['CampaignBlock by id', 'CampaignRegion by id', 'Campaign']
      ],
      [
        'language rows + Campaign row (language add and remove)',
        { campaignRow: true, languageRows: true },
        ['every CampaignLanguage', 'Campaign']
      ],
      [
        'every kind at once',
        {
          campaignRow: true,
          shareLanguage: 'regionLanguageId',
          languageRows: true,
          targets: [{ kind: 'string', id: 'stringId' }],
          structure: true
        },
        [
          'structure',
          'CampaignString by id',
          'every CampaignLanguage',
          'CampaignRegionLanguage',
          'Campaign'
        ]
      ]
    ])('%s', async (_name, declaration, expected) => {
      await write(declaration)

      expect(locks()).toEqual(expected)
    })

    it('takes each lock once: text rows cover the targets, and a campaign target is the Campaign row', async () => {
      await write({
        textRows: true,
        targets: [
          { kind: 'block', id: 'blockId' },
          { kind: 'campaign', id: 'campaignId' }
        ],
        campaignRow: true
      })

      expect(locks()).toEqual([
        'every CampaignBlock',
        'every CampaignRegion',
        'every CampaignString',
        'Campaign'
      ])
    })

    it('takes every lock before the body runs', async () => {
      await write({ structure: true, campaignRow: true }, async () => {
        events.push('body')
      })

      expect(events).toEqual([
        'structure',
        'Campaign',
        'body',
        'touch',
        'commit'
      ])
    })
  })

  describe('the touch', () => {
    it('is the last write, on the campaign', async () => {
      await write({ structure: true }, async () => {
        events.push('body')
      })

      expect(events).toEqual(['structure', 'body', 'touch', 'commit'])
      expect(fakeTx.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })

    it('is skipped for touch: false', async () => {
      await write({ touch: false })

      expect(fakeTx.campaign.update).not.toHaveBeenCalled()
    })

    it('is skipped after skipTouch()', async () => {
      await write({}, async ({ skipTouch }) => {
        skipTouch()
      })

      expect(fakeTx.campaign.update).not.toHaveBeenCalled()
    })
  })

  it('returns what the body returns and passes the options through', async () => {
    const result = await write({}, async () => 'result', { timeout: 30_000 })

    expect(result).toBe('result')
    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 30_000
    })
  })

  it('opens the transaction with no options when none are given', async () => {
    await write({})

    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function))
  })

  describe('after-commit jobs', () => {
    it('run in queue order once the transaction has resolved, before the write returns', async () => {
      await write({}, async ({ afterCommit }) => {
        afterCommit(async () => {
          events.push('first job')
        })
        afterCommit(async () => {
          events.push('second job')
        })
      })

      expect(events).toEqual(['touch', 'commit', 'first job', 'second job'])
    })

    it('do not run when the body throws', async () => {
      const job = vi.fn()

      await expect(
        write({}, async ({ afterCommit }) => {
          afterCommit(job)
          throw new Error('body failed')
        })
      ).rejects.toThrow('body failed')
      expect(job).not.toHaveBeenCalled()
      expect(fakeTx.campaign.update).not.toHaveBeenCalled()
    })

    it('do not run when the commit fails', async () => {
      const job = vi.fn()
      commitFails = true

      await expect(
        write({}, async ({ afterCommit }) => {
          afterCommit(job)
        })
      ).rejects.toThrow('commit failed')
      expect(job).not.toHaveBeenCalled()
    })

    it('log a job that throws, run the next and still return the result', async () => {
      const error = vi
        .spyOn(logger, 'error')
        .mockImplementation(() => undefined)
      const failure = new Error('queue down')
      const next = vi.fn(async () => undefined)

      const result = await write({}, async ({ afterCommit }) => {
        afterCommit(async () => {
          throw failure
        })
        afterCommit(next)
        return 'result'
      })

      expect(result).toBe('result')
      expect(next).toHaveBeenCalled()
      expect(error).toHaveBeenCalledWith(
        { error: failure, campaignId: 'campaignId' },
        'campaign after-commit job failed'
      )
    })
  })

  describe('the external step', () => {
    function step(): {
      apply: () => Promise<void>
      revert: () => Promise<void>
    } {
      return {
        apply: vi.fn(async () => {
          events.push('apply')
        }),
        revert: vi.fn(async () => {
          events.push('revert')
        })
      }
    }

    it('applies after the touch, as the last statement before the commit', async () => {
      await write({}, async ({ externalStep }) => {
        externalStep(step())
      })

      expect(events).toEqual(['touch', 'apply', 'commit'])
    })

    it('applies after the body even with touch: false', async () => {
      await write({ touch: false }, async ({ externalStep }) => {
        externalStep(step())
        events.push('body')
      })

      expect(events).toEqual(['body', 'apply', 'commit'])
    })

    it('reverts when the commit fails after apply, and rethrows the commit error', async () => {
      commitFails = true

      await expect(
        write({}, async ({ externalStep }) => {
          externalStep(step())
        })
      ).rejects.toThrow('commit failed')
      expect(events).toEqual(['touch', 'apply', 'commit', 'revert'])
    })

    it('logs a revert that fails and still rethrows the commit error', async () => {
      const error = vi
        .spyOn(logger, 'error')
        .mockImplementation(() => undefined)
      const revertFailure = new Error('gateway down')
      commitFails = true

      await expect(
        write({}, async ({ externalStep }) => {
          externalStep({
            apply: async () => undefined,
            revert: async () => {
              throw revertFailure
            }
          })
        })
      ).rejects.toThrow('commit failed')
      expect(error).toHaveBeenCalledWith(
        { error: revertFailure },
        'short link revert failed'
      )
    })

    it('does not revert when apply itself throws', async () => {
      const failing = step()
      vi.mocked(failing.apply).mockRejectedValue(new Error('apply failed'))

      await expect(
        write({}, async ({ externalStep }) => {
          externalStep(failing)
        })
      ).rejects.toThrow('apply failed')
      expect(failing.revert).not.toHaveBeenCalled()
      expect(events).not.toContain('commit')
    })

    it('is not applied when the body throws after registering it', async () => {
      const registered = step()

      await expect(
        write({}, async ({ externalStep }) => {
          externalStep(registered)
          throw new Error('body failed')
        })
      ).rejects.toThrow('body failed')
      expect(registered.apply).not.toHaveBeenCalled()
      expect(registered.revert).not.toHaveBeenCalled()
    })

    it('throws on a second registration', async () => {
      await expect(
        write({}, async ({ externalStep }) => {
          externalStep(step())
          externalStep(step())
        })
      ).rejects.toThrow('a campaign write has at most one external step')
      expect(events).not.toContain('apply')
    })
  })
})
