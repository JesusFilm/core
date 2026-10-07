import { normalizedExecutor } from '@graphql-tools/executor'
import { initContextCache } from '@pothos/core'
import { streamText } from 'ai'
import { parse } from 'graphql'
import { isAsyncIterable } from 'graphql-yoga'
import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

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

/** The model fake: answers every requested line with `FR <id> <field>`, unless overridden. */
function scriptModel(overrides: Record<string, string> = {}): void {
  mockStreamText.mockImplementation(((options: unknown) => ({
    elementStream: createMockAsyncIterator<ScriptedItem>(
      requestedLines(options).map(([targetId, field]) => ({
        targetId,
        field,
        value: overrides[`${targetId}:${field}`] ?? `FR ${targetId} ${field}`
      }))
    )
  })) as unknown as typeof streamText)
}

describe('campaignAiTranslate', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }

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
          ledeTranslations: {
            [FRENCH]: { value: 'Ancienne version', source: 'machine' }
          }
        }
      return block
    })
  }

  async function run(
    input: { languageId?: string; mode: 'all' | 'missing' },
    user = mockUser
  ): Promise<Array<{ progress: number; message: string; campaign: unknown }>> {
    const updates = []
    for await (const update of campaignAiTranslate(
      { campaignId: 'campaignId', languageId: FRENCH, ...input },
      user
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

  beforeEach(() => {
    vi.clearAllMocks()
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
    it('writes machine entries only where the language has no entry', async () => {
      await run({ mode: 'missing' })

      const hero$ = blockWrites().heroId
      expect(hero$.eyebrowTranslations).toEqual({
        [FRENCH]: { value: 'FR heroId eyebrow', source: 'machine' }
      })
      expect(hero$.titleTranslations).toBeUndefined()
      expect(hero$.ledeTranslations).toBeUndefined()
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
      expect(asked).not.toContain('heroId:lede')
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
      expect(written.ledeTranslations).toEqual({
        [FRENCH]: { value: 'FR heroId lede', source: 'machine' }
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
              ledeTranslations: {
                [FRENCH]: { value: 'Écrit à la main', source: 'human' }
              }
            }
          : block
      }) as any)

      await run({ mode: 'all' })

      expect(blockWrites().heroId?.ledeTranslations).toBeUndefined()
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
        campaign
      })
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
        campaign: null
      })
      expect(reports.at(-1).data.campaignAiTranslateSubscription).toEqual({
        progress: 100,
        message: 'Translation completed!',
        campaign: { id: 'campaignId' }
      })
    })

    it('requires an authenticated caller', async () => {
      await expect(subscribeAs(null)).rejects.toThrow('Not authenticated')
      expect(mockStreamText).not.toHaveBeenCalled()
    })
  })
})
