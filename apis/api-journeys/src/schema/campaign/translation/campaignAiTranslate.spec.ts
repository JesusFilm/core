import { normalizedExecutor } from '@graphql-tools/executor'
import { initContextCache } from '@pothos/core'
import { streamText } from 'ai'
import { parse } from 'graphql'
import { isAsyncIterable } from 'graphql-yoga'
import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockUser } from '../../../../test/campaignBlockSpec'
import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { promptOf } from '../../../../test/promptOf'
import { logger } from '../../../logger'
import { schema } from '../../index'
import { fetchLanguageName } from '../gatewayClient'

import { campaignAiTranslate } from './campaignAiTranslate'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

/** An in-memory Redis for the one-run key: `SET NX` and the two compare-and-act scripts. */
const redis = vi.hoisted(() => {
  const store = new Map<string, string>()
  return {
    store,
    set: vi.fn(async (key: string, value: string) => {
      if (store.has(key)) return null
      store.set(key, value)
      return 'OK'
    }),
    eval: vi.fn(
      async (script: string, _keys: number, key: string, token: string) => {
        if (store.get(key) !== token) return 0
        if (script.includes("'del'")) store.delete(key)
        return 1
      }
    ),
    on: vi.fn()
  }
})

vi.mock('ioredis', () => ({
  default: vi.fn(function () {
    return redis
  })
}))
vi.mock('ai', () => ({
  Output: { array: vi.fn((config) => ({ type: 'array', ...config })) },
  streamText: vi.fn()
}))
vi.mock('@core/shared/ai/prompts', () => ({
  hardenPrompt: vi.fn((text) => text),
  preSystemPrompt: 'mocked system prompt'
}))
vi.mock('@core/shared/ai/openrouterModel', () => ({
  AiRequestTimeoutError: class AiRequestTimeoutError extends Error {},
  createOpenrouterFallbackSession: vi.fn(() => ({
    execute: async (run: (model: string, signal: AbortSignal) => unknown) =>
      await run('mocked-model', new AbortController().signal)
  }))
}))
vi.mock('../gatewayClient', () => ({
  fetchLanguage: vi.fn(),
  fetchLanguageName: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const mockStreamText = streamText as MockedFunction<typeof streamText>
const mockFetchLanguageName = fetchLanguageName as MockedFunction<
  typeof fetchLanguageName
>

const FRENCH = '496'
const SPANISH = '21028'

interface ScriptedItem {
  targetId: string
  field: string
  value: string
  uncertain?: boolean
}

function createMockAsyncIterator<T>(items: T[]): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: () => {
      let index = 0
      return {
        next: () =>
          Promise.resolve(
            index < items.length
              ? { done: false, value: items[index++] }
              : { done: true, value: undefined }
          )
      }
    }
  }
}

/** The ids and fields a batch prompt asks for, in the order asked. */
function requestedLines(options: unknown): Array<[string, string]> {
  return [...promptOf(options).matchAll(/^\[([^\]]+)\] (\w+) \(max/gm)].map(
    ([, targetId, field]) => [targetId, field]
  )
}

/** The model fake: answers every requested line with `FR <id> <field>`, unless overridden; sure of every line unless listed as uncertain. */
function scriptModel(
  overrides: Record<string, string> = {},
  uncertain: string[] = []
): void {
  mockStreamText.mockImplementation(((options: unknown) => ({
    elementStream: createMockAsyncIterator<ScriptedItem>(
      requestedLines(options).map(([targetId, field]) => ({
        targetId,
        field,
        value: overrides[`${targetId}:${field}`] ?? `FR ${targetId} ${field}`,
        uncertain: uncertain.includes(`${targetId}:${field}`)
      }))
    )
  })) as unknown as typeof streamText)
}

describe('campaignAiTranslate', () => {
  const fixture = campaignFactory({ role: 'member' })
    .withLanguage(FRENCH)
    .withLanguage(SPANISH)
    .withRegion('Europe')
    .build()
  const region = fixture.regions[0]
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!

  const campaign = {
    ...fixture,
    blocks: fixture.blocks.map((block) => {
      if (block.id === hero.id)
        return {
          ...block,
          titleTranslations: {
            [FRENCH]: { value: 'Titre de la personne', source: 'human' },
            [SPANISH]: { value: 'Título', source: 'machine' }
          },
          descriptionTranslations: {
            [FRENCH]: { value: 'Ancienne version', source: 'machine' }
          }
        }
      return block
    })
  }

  async function run(
    input: { languageId?: string; mode: 'all' | 'missing' },
    user = mockUser,
    cancelSignal?: AbortSignal
  ): Promise<
    Array<{
      progress: number
      message: string
      translatedCount: number
      campaign: unknown
    }>
  > {
    const updates = []
    for await (const update of campaignAiTranslate(
      { campaignId: 'campaignId', languageId: FRENCH, ...input },
      user,
      cancelSignal
    ))
      updates.push(update)
    return updates
  }

  /** Every `<field>Translations` write of a block update, keyed by block id. */
  function blockWrites(): Record<string, Record<string, any>> {
    return Object.fromEntries(
      prismaMock.campaignBlock.update.mock.calls.map(([{ where, data }]) => [
        where.id,
        data
      ])
    )
  }

  /** The in-transaction read of the campaign's default and languages. */
  function isLanguageReread(args: any): boolean {
    return args?.select?.defaultLanguageId === true
  }

  beforeEach(() => {
    vi.clearAllMocks()
    redis.store.clear()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaignBlock.findFirst.mockImplementation(
      (async ({ where }: any) =>
        campaign.blocks.find((block) => block.id === where.id) ?? null) as any
    )
    prismaMock.campaignString.findUnique.mockImplementation(
      (async ({ where }: any) =>
        campaign.strings.find((string) => string.id === where.id) ??
        null) as any
    )
    prismaMock.campaignRegion.findUnique.mockResolvedValue(region)
    mockFetchLanguageName.mockImplementation(async (id) =>
      id === FRENCH ? 'French' : 'English'
    )
    scriptModel()
  })

  describe('mode missing', () => {
    it('keeps the model’s doubt on a line it was unsure of, and nothing on the rest', async () => {
      scriptModel({}, ['heroId:eyebrow'])

      await run({ mode: 'missing' })

      expect(blockWrites().heroId.eyebrowTranslations).toEqual({
        [FRENCH]: {
          value: 'FR heroId eyebrow',
          source: 'machine',
          uncertain: true
        }
      })
      expect(prismaMock.campaignString.update).toHaveBeenCalledWith({
        where: { id: 'string-copy' },
        data: {
          valueTranslations: {
            [FRENCH]: { value: 'FR string-copy value', source: 'machine' }
          }
        }
      })
    })

    it('writes machine entries only where the language has no entry', async () => {
      await run({ mode: 'missing' })

      const hero$ = blockWrites().heroId
      expect(hero$.eyebrowTranslations).toEqual({
        [FRENCH]: { value: 'FR heroId eyebrow', source: 'machine' }
      })
      expect(hero$.titleTranslations).toBeUndefined()
      expect(hero$.descriptionTranslations).toBeUndefined()
      expect(prismaMock.campaignString.update).toHaveBeenCalledWith({
        where: { id: 'string-copy' },
        data: {
          valueTranslations: {
            [FRENCH]: { value: 'FR string-copy value', source: 'machine' }
          }
        }
      })
      expect(prismaMock.campaignRegion.update).toHaveBeenCalledWith({
        where: { id: region.id },
        data: {
          nameTranslations: {
            [FRENCH]: { value: `FR ${region.id} name`, source: 'machine' }
          }
        }
      })
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: {
          titleTranslations: {
            [FRENCH]: { value: 'FR campaignId title', source: 'machine' }
          }
        }
      })
    })

    it('does not ask the model for lines that already have an entry', async () => {
      await run({ mode: 'missing' })

      const asked = mockStreamText.mock.calls.flatMap(([options]) =>
        requestedLines(options).map(([id, field]) => `${id}:${field}`)
      )
      expect(asked).toContain('heroId:eyebrow')
      expect(asked).not.toContain('heroId:title')
      expect(asked).not.toContain('heroId:description')
    })

    it('keeps other languages’ entries in the same column', async () => {
      await run({ mode: 'missing', languageId: FRENCH })

      expect(blockWrites().heroId.titleTranslations).toBeUndefined()
      await run({ mode: 'all', languageId: SPANISH })
      const spanishTitle = blockWrites().heroId.titleTranslations
      expect(spanishTitle[FRENCH]).toEqual({
        value: 'Titre de la personne',
        source: 'human'
      })
    })
  })

  describe('mode all', () => {
    it('overwrites machine entries and never human ones', async () => {
      await run({ mode: 'all' })

      const written = blockWrites().heroId
      expect(written.descriptionTranslations).toEqual({
        [FRENCH]: { value: 'FR heroId description', source: 'machine' }
      })
      expect(written.titleTranslations).toBeUndefined()
      const asked = mockStreamText.mock.calls.flatMap(([options]) =>
        requestedLines(options).map(([id, field]) => `${id}:${field}`)
      )
      expect(asked).not.toContain('heroId:title')
    })

    it('does not overwrite a human entry written after the run began', async () => {
      prismaMock.campaignBlock.findFirst.mockImplementation((async ({
        where
      }: any) => {
        const block = campaign.blocks.find((b) => b.id === where.id)
        return where.id === 'heroId'
          ? {
              ...block,
              descriptionTranslations: {
                [FRENCH]: { value: 'Écrit à la main', source: 'human' }
              }
            }
          : block
      }) as any)

      await run({ mode: 'all' })

      expect(blockWrites().heroId?.descriptionTranslations).toBeUndefined()
    })
  })

  describe('locking', () => {
    it('keeps a human entry committed while the batch waited for its row lock', async () => {
      let committed = false
      prismaMock.$queryRaw.mockImplementation((async (
        _sql: TemplateStringsArray,
        ...values: unknown[]
      ) => {
        if (values.flat().includes('heroId')) committed = true
        return []
      }) as any)
      prismaMock.campaignBlock.findFirst.mockImplementation((async ({
        where
      }: any) => {
        const block = campaign.blocks.find((b) => b.id === where.id) ?? null
        if (!committed || where.id !== 'heroId') return block
        return {
          ...block,
          ledeTranslations: {
            [FRENCH]: { value: 'Écrit à la main', source: 'human' }
          }
        }
      }) as any)

      await run({ mode: 'all' })

      const hero$ = blockWrites().heroId
      expect(hero$.ledeTranslations).toBeUndefined()
      expect(hero$.eyebrowTranslations).toEqual({
        [FRENCH]: { value: 'FR heroId eyebrow', source: 'machine' }
      })
    })

    it('locks blocks, regions, strings, then the campaign, each by id, before re-reading', async () => {
      const regionLine = {
        ...hero,
        id: 'regionLineId',
        typename: 'CampaignTypographyBlock',
        pageId: null,
        regionId: region.id,
        parentBlockId: null,
        parentOrder: 0,
        eyebrow: null,
        title: null,
        description: null,
        content: 'EUR'
      }
      const withLine = { ...campaign, blocks: [...campaign.blocks, regionLine] }
      prismaMock.campaign.findUnique.mockResolvedValue(withLine)
      prismaMock.campaignBlock.findFirst.mockImplementation(
        (async ({ where }: any) =>
          withLine.blocks.find((block) => block.id === where.id) ?? null) as any
      )
      const transactions: string[][] = []
      const log = (event: string): void => {
        transactions.at(-1)?.push(event)
      }
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        transactions.push([])
        return await callback(prismaMock)
      })
      prismaMock.$queryRaw.mockImplementation((async (
        sql: TemplateStringsArray
      ) => {
        const statement = sql.join('?')
        expect(statement).toContain('FOR UPDATE')
        log(`lock ${/FROM "(\w+)"/.exec(statement)?.[1]}`)
        if (statement.includes('ANY'))
          expect(statement).toContain('ORDER BY id')
        return []
      }) as any)
      const findUnique = prismaMock.campaign.findUnique.getMockImplementation()
      prismaMock.campaign.findUnique.mockImplementation(((args: any) => {
        if (isLanguageReread(args)) log('re-read')
        return findUnique?.(args)
      }) as any)
      prismaMock.campaignBlock.findFirst.mockImplementation((async ({
        where
      }: any) => {
        log('read')
        return withLine.blocks.find((block) => block.id === where.id) ?? null
      }) as any)

      await run({ mode: 'all' })

      const order = [
        'CampaignBlock',
        'CampaignRegion',
        'CampaignString',
        'Campaign'
      ]
      expect(transactions.length).toBeGreaterThan(0)
      for (const events of transactions) {
        const locks = events
          .filter((event) => event.startsWith('lock '))
          .map((event) => event.slice('lock '.length))
        expect(locks.at(-1)).toBe('Campaign')
        const indexes = locks.map((table) => order.indexOf(table))
        expect(indexes).toEqual([...indexes].sort((a, b) => a - b))
        expect(new Set(locks).size).toBe(locks.length)
        expect(events.indexOf('re-read')).toBe(locks.length)
      }
      const tables = transactions.map((events) =>
        events.filter((event) => event.startsWith('lock ')).join(', ')
      )
      expect(tables).toContain(
        'lock CampaignBlock, lock CampaignString, lock Campaign'
      )
      expect(tables).toContain(
        'lock CampaignBlock, lock CampaignRegion, lock Campaign'
      )
      const regionBatch = prismaMock.$queryRaw.mock.calls.find(([sql]) =>
        (sql as unknown as string[]).join('').includes('"CampaignRegion"')
      )
      expect(regionBatch?.slice(1)).toEqual([[region.id]])
    })

    it('writes nothing in a batch whose re-read shows the language promoted to default', async () => {
      prismaMock.campaign.findUnique.mockImplementation((async (args: any) =>
        isLanguageReread(args)
          ? { ...campaign, defaultLanguageId: FRENCH }
          : campaign) as any)

      const updates = await run({ mode: 'all' })

      expect(mockStreamText).toHaveBeenCalled()
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
      expect(prismaMock.campaignRegion.update).not.toHaveBeenCalled()
      expect(prismaMock.campaignString.update).not.toHaveBeenCalled()
      expect(prismaMock.campaign.update).not.toHaveBeenCalled()
      expect(updates.at(-1)?.translatedCount).toBe(0)
    })

    it('skips a batch whose re-read shows the language removed, and still runs the next', async () => {
      let rereads = 0
      prismaMock.campaign.findUnique.mockImplementation((async (args: any) => {
        if (!isLanguageReread(args)) return campaign
        rereads++
        return rereads === 1
          ? {
              ...campaign,
              languages: campaign.languages.filter(
                (language) => language.languageId !== FRENCH
              )
            }
          : campaign
      }) as any)

      await run({ mode: 'all' })

      expect(rereads).toBeGreaterThan(1)
      expect(prismaMock.campaignString.update).not.toHaveBeenCalled()
      expect(prismaMock.campaign.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titleTranslations: expect.anything()
          })
        })
      )
      expect(blockWrites().heroId.eyebrowTranslations).toEqual({
        [FRENCH]: { value: 'FR heroId eyebrow', source: 'machine' }
      })
    })
  })

  describe('one run per campaign language', () => {
    const KEY = `campaign-translate:campaignId:${FRENCH}`

    it('takes the key with a TTL, extends it after every batch and releases it when the run completes', async () => {
      await run({ mode: 'all' })

      expect(redis.set).toHaveBeenCalledWith(
        KEY,
        expect.any(String),
        'EX',
        600,
        'NX'
      )
      const token = redis.set.mock.calls[0][1]
      const extends$ = redis.eval.mock.calls.filter(([script]) =>
        script.includes("'expire'")
      )
      expect(extends$).toHaveLength(mockStreamText.mock.calls.length)
      expect(extends$[0].slice(1)).toEqual([1, KEY, token, 600])
      expect(redis.eval).toHaveBeenLastCalledWith(
        expect.stringContaining("'del'"),
        1,
        KEY,
        token
      )
      expect(redis.store.has(KEY)).toBe(false)
    })

    it('refuses a second run into the same language while one runs (CONFLICT, field languageId)', async () => {
      const first = campaignAiTranslate(
        { campaignId: 'campaignId', languageId: FRENCH, mode: 'all' },
        mockUser
      )
      await first.next()
      await first.next()
      expect(redis.store.has(KEY)).toBe(true)
      mockStreamText.mockClear()

      await expect(run({ mode: 'all' })).rejects.toMatchObject({
        extensions: { code: 'CONFLICT', field: 'languageId' }
      })
      expect(mockStreamText).not.toHaveBeenCalled()
      expect(redis.store.has(KEY)).toBe(true)

      await expect(
        run({ mode: 'all', languageId: SPANISH })
      ).resolves.toBeDefined()

      await first.return(undefined)
      expect(redis.store.has(KEY)).toBe(false)
    })

    it('releases the key when the caller cancels mid-batch', async () => {
      const disconnect = new AbortController()
      const scripted = mockStreamText.getMockImplementation()!
      mockStreamText.mockImplementation((options: unknown) => {
        expect(redis.store.has(KEY)).toBe(true)
        disconnect.abort()
        return scripted(options as never)
      })

      await run({ mode: 'all' }, mockUser, disconnect.signal)

      expect(redis.store.has(KEY)).toBe(false)
    })

    it('releases the key when the run fails', async () => {
      mockStreamText.mockImplementation(() => {
        throw new Error('model down')
      })

      await expect(run({ mode: 'all' })).rejects.toThrow('Translation failed')
      expect(redis.store.has(KEY)).toBe(false)
    })

    it('does not release a key another run took after this one’s expired', async () => {
      const scripted = mockStreamText.getMockImplementation()!
      mockStreamText.mockImplementation((options: unknown) => {
        redis.store.set(KEY, 'another-run')
        return scripted(options as never)
      })

      await run({ mode: 'all' })

      expect(redis.store.get(KEY)).toBe('another-run')
    })

    it('refuses the run and calls no model when Redis cannot be reached', async () => {
      redis.set.mockRejectedValueOnce(new Error('connect ECONNREFUSED'))

      await expect(run({ mode: 'all' })).rejects.toThrow(
        'Translation is temporarily unavailable. Please try again.'
      )
      expect(mockStreamText).not.toHaveBeenCalled()
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('takes no key when the caller may not run', async () => {
      await expect(
        run({ mode: 'missing', languageId: '529' })
      ).rejects.toThrow()
      await expect(
        run({ mode: 'missing' }, { ...mockUser, id: 'someoneElse' })
      ).rejects.toThrow()

      expect(redis.set).not.toHaveBeenCalled()
    })
  })

  describe('batching and progress', () => {
    it('streams once per page section, once for the interface and once for the regions', async () => {
      await run({ mode: 'all' })

      const prompts = mockStreamText.mock.calls.map(([options]) =>
        requestedLines(options).map(([id]) => id)
      )
      const sectionRoots = prompts.filter((ids) => ids.includes('heroId'))
      expect(sectionRoots).toHaveLength(1)
      expect(sectionRoots[0]).toEqual(['heroId', 'heroId', 'heroButtonId'])
      const interfaceBatch = prompts.find((ids) => ids.includes('string-copy'))!
      expect(interfaceBatch).toEqual(
        expect.arrayContaining(['campaignId', 'string-open', 'navHomeId'])
      )
      expect(interfaceBatch).not.toContain('heroId')
      const regions = prompts.filter((ids) => ids.includes(region.id))
      expect(regions).toEqual([[region.id]])
      const everyId = prompts.flat()
      expect(everyId.filter((id) => id === 'string-copy')).toHaveLength(1)
    })

    it('yields progress after every batch and the campaign at the end', async () => {
      const updates = await run({ mode: 'all' })

      const batches = mockStreamText.mock.calls.length
      expect(updates[0]).toEqual({
        progress: 0,
        message: 'Starting translation...',
        translatedCount: 0,
        campaign: null
      })
      const progress = updates.map((update) => update.progress)
      expect(progress).toEqual([...progress].sort((a, b) => a - b))
      expect(
        updates.filter((update) => update.message.startsWith('Translated '))
      ).toHaveLength(batches)
      expect(updates.slice(0, -1).every((u) => u.campaign == null)).toBe(true)
      expect(updates.at(-1)).toEqual({
        progress: 100,
        message: 'Translation completed!',
        translatedCount: expect.any(Number),
        campaign
      })
    })

    it('counts the strings written, cumulatively', async () => {
      const updates = await run({ mode: 'all' })

      const counts = updates.map((update) => update.translatedCount)
      expect(counts).toEqual([...counts].sort((a, b) => a - b))
      expect(counts.at(-1)).toBeGreaterThan(0)
      expect(updates.at(-1)?.translatedCount).toBe(counts.at(-1))
    })

    it('bumps the campaign once per batch that wrote something', async () => {
      await run({ mode: 'missing' })

      const touches = prismaMock.campaign.update.mock.calls.filter(
        ([{ data }]) => 'updatedAt' in data
      )
      expect(touches.length).toBeGreaterThan(0)
    })

    it('describes lines to the model with the language names', async () => {
      await run({ mode: 'missing' })

      expect(promptOf(mockStreamText.mock.calls[0][0])).toContain(
        'Translate from English to French.'
      )
      expect(mockFetchLanguageName).toHaveBeenCalledWith('529')
      expect(mockFetchLanguageName).toHaveBeenCalledWith(FRENCH)
    })

    it('ignores lines the model invents', async () => {
      mockStreamText.mockImplementation((() => ({
        elementStream: createMockAsyncIterator<ScriptedItem>([
          { targetId: 'invented', field: 'title', value: 'x' },
          { targetId: 'heroId', field: 'content', value: 'x' }
        ])
      })) as unknown as typeof streamText)

      await run({ mode: 'missing' })

      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('writes nothing more once the caller disconnects mid-batch', async () => {
      const disconnect = new AbortController()
      const scripted = mockStreamText.getMockImplementation()!
      mockStreamText.mockImplementation((options: unknown) => {
        disconnect.abort()
        return scripted(options as never)
      })

      const updates = await run({ mode: 'all' }, mockUser, disconnect.signal)

      expect(mockStreamText).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
      expect(prismaMock.campaignString.update).not.toHaveBeenCalled()
      expect(updates.every((update) => update.progress < 100)).toBe(true)
    })

    it('aborts the model call when the caller disconnects', async () => {
      const disconnect = new AbortController()
      const scripted = mockStreamText.getMockImplementation()!
      mockStreamText.mockImplementation((options: unknown) => {
        disconnect.abort()
        expect(
          (options as { abortSignal: AbortSignal }).abortSignal.aborted
        ).toBe(true)
        return scripted(options as never)
      })

      await run({ mode: 'all' }, mockUser, disconnect.signal)
    })

    it('fails when every batch fails', async () => {
      mockStreamText.mockImplementation(() => {
        throw new Error('model down')
      })

      await expect(run({ mode: 'all' })).rejects.toThrow('Translation failed')
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })
  })

  describe('caps', () => {
    it('truncates output longer than the field cap and logs a warning', async () => {
      const warn = vi.spyOn(logger, 'warn')
      scriptModel({ 'heroId:eyebrow': 'é'.repeat(200) })

      await run({ mode: 'missing' })

      const written = blockWrites().heroId.eyebrowTranslations[FRENCH]
      expect(written).toEqual({ value: 'é'.repeat(80), source: 'machine' })
      expect(warn).toHaveBeenCalledWith(
        expect.objectContaining({
          targetId: 'heroId',
          field: 'eyebrow',
          length: 200,
          cap: 80
        }),
        expect.stringContaining('truncated')
      )
    })
  })

  describe('validation', () => {
    it('refuses a missing campaign', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(null)

      await expect(run({ mode: 'missing' })).rejects.toThrow(
        'campaign not found'
      )
    })

    it('refuses a caller outside the team', async () => {
      await expect(
        run({ mode: 'missing' }, { ...mockUser, id: 'someoneElse' })
      ).rejects.toThrow('user is not allowed to update campaign')
      expect(mockStreamText).not.toHaveBeenCalled()
    })

    it.each([
      ['the default language', '529'],
      ['a language the campaign does not have', '999']
    ])('refuses %s', async (_name, languageId) => {
      await expect(run({ mode: 'missing', languageId })).rejects.toThrow(
        'languageId must be a campaign language other than the default'
      )
    })

    it('refuses a language api-languages does not know', async () => {
      mockFetchLanguageName.mockResolvedValue(null)

      await expect(run({ mode: 'missing' })).rejects.toThrow(
        'languageId must be an existing language'
      )
    })
  })

  describe('campaignAiTranslateSubscription', () => {
    const subscription: any = parse(`
      subscription CampaignAiTranslateSubscription(
        $input: CampaignAiTranslateInput!
      ) {
        campaignAiTranslateSubscription(input: $input) {
          progress
          message
          translatedCount
          campaign {
            id
          }
        }
      }
    `)

    async function subscribeAs(user: typeof mockUser | null): Promise<any[]> {
      const result = await normalizedExecutor({
        schema: schema as any,
        document: subscription,
        variableValues: {
          input: { campaignId: 'campaignId', languageId: FRENCH, mode: 'all' }
        },
        contextValue: {
          ...initContextCache(),
          type: user == null ? 'public' : 'authenticated',
          user,
          currentRoles: []
        }
      })
      if (!isAsyncIterable(result)) return [result]
      const reports = []
      for await (const report of result) reports.push(report)
      return reports
    }

    it('streams progress reports to the caller', async () => {
      const reports = await subscribeAs(mockUser)

      expect(reports[0].data.campaignAiTranslateSubscription).toEqual({
        progress: 0,
        message: 'Starting translation...',
        translatedCount: 0,
        campaign: null
      })
      expect(reports.at(-1).data.campaignAiTranslateSubscription).toEqual({
        progress: 100,
        message: 'Translation completed!',
        translatedCount: expect.any(Number),
        campaign: { id: 'campaignId' }
      })
    })

    it('requires an authenticated caller', async () => {
      await expect(subscribeAs(null)).rejects.toThrow('Not authenticated')
      expect(mockStreamText).not.toHaveBeenCalled()
    })
  })
})
