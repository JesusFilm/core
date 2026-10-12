import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../../test/campaignFactory'
import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

import {
  pickTranslationTarget,
  withTranslation
} from './campaignTranslationSet.mutation'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const FRENCH = '496'

describe('campaignTranslationSet', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const CAMPAIGN_TRANSLATION_SET = graphql(`
    mutation CampaignTranslationSet($input: CampaignTranslationSetInput!) {
      campaignTranslationSet(input: $input) {
        languageId
        value
        source
      }
    }
  `)

  async function set(input: {
    target: Record<string, string>
    field: string
    languageId?: string
    value: string
  }): Promise<any> {
    return await authClient({
      document: CAMPAIGN_TRANSLATION_SET,
      variables: { input: { languageId: FRENCH, ...input } }
    })
  }

  const fixture = campaignFactory({ role: 'member' })
    .withLanguage(FRENCH)
    .withRegion('EUR')
    .build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const copy = fixture.strings.find((string) => string.key === 'copy')!
  const region = fixture.regions[0]

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
    const heroWithSpanish = {
      ...hero,
      titleTranslations: {
        '21028': { value: 'Comparte la historia', source: 'machine' }
      },
      campaign: fixture
    }
    prismaMock.campaignBlock.findFirst.mockResolvedValue(heroWithSpanish)
    prismaMock.campaignBlock.findUnique.mockResolvedValue(heroWithSpanish)
    prismaMock.campaignRegion.findUnique.mockResolvedValue({
      ...region,
      campaign: fixture
    })
    prismaMock.campaignString.findUnique.mockResolvedValue({
      ...copy,
      campaign: fixture
    })
    prismaMock.campaign.findUnique.mockResolvedValue(fixture)
  })

  it('writes a human translation of a block field and returns the field translations', async () => {
    const result = await set({
      target: { blockId: 'heroId' },
      field: 'title',
      value: "  Partagez l'histoire de Noël  "
    })

    expect(result).toEqual({
      data: {
        campaignTranslationSet: [
          {
            languageId: FRENCH,
            value: "Partagez l'histoire de Noël",
            source: 'human'
          },
          {
            languageId: '21028',
            value: 'Comparte la historia',
            source: 'machine'
          }
        ]
      }
    })
    expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'heroId', deletedAt: null } })
    )
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroId' },
      data: {
        titleTranslations: {
          '21028': { value: 'Comparte la historia', source: 'machine' },
          [FRENCH]: { value: "Partagez l'histoire de Noël", source: 'human' }
        }
      }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
  })

  it('merges into the translations read under the row lock, not the earlier read', async () => {
    prismaMock.campaignBlock.findUnique.mockResolvedValue({
      titleTranslations: {
        '21028': { value: 'Comparte la historia', source: 'machine' },
        '529': { value: 'Share the story', source: 'human' }
      }
    } as any)

    await set({
      target: { blockId: 'heroId' },
      field: 'title',
      value: 'Partagez'
    })

    const lockSql = (
      prismaMock.$queryRaw.mock.calls[0][0] as unknown as readonly string[]
    ).join(' ')
    expect(lockSql).toContain('"CampaignBlock"')
    expect(lockSql).toContain('FOR UPDATE')
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroId' },
      data: {
        titleTranslations: {
          '21028': { value: 'Comparte la historia', source: 'machine' },
          '529': { value: 'Share the story', source: 'human' },
          [FRENCH]: { value: 'Partagez', source: 'human' }
        }
      }
    })
  })

  it('clears the entry on an empty value without tripping required', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue({
      ...region,
      nameTranslations: { [FRENCH]: { value: 'Europe', source: 'human' } },
      campaign: fixture
    })

    const result = await set({
      target: { regionId: region.id },
      field: 'name',
      value: '   '
    })

    expect(result).toEqual({ data: { campaignTranslationSet: [] } })
    expect(prismaMock.campaignRegion.update).toHaveBeenCalledWith({
      where: { id: region.id },
      data: { nameTranslations: {} }
    })
  })

  it('translates a Campaign String by stringId and the campaign title by campaignId', async () => {
    const string = await set({
      target: { stringId: copy.id },
      field: 'value',
      value: 'Copier le lien'
    })
    expect(string.data.campaignTranslationSet).toEqual([
      { languageId: FRENCH, value: 'Copier le lien', source: 'human' }
    ])
    expect(prismaMock.campaignString.update).toHaveBeenCalledWith({
      where: { id: copy.id },
      data: {
        valueTranslations: {
          [FRENCH]: { value: 'Copier le lien', source: 'human' }
        }
      }
    })

    const title = await set({
      target: { campaignId: 'campaignId' },
      field: 'title',
      value: 'Noël 2026'
    })
    expect(title.data.campaignTranslationSet).toEqual([
      { languageId: FRENCH, value: 'Noël 2026', source: 'human' }
    ])
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: {
        titleTranslations: { [FRENCH]: { value: 'Noël 2026', source: 'human' } }
      }
    })
  })

  it('inherits the target field cap through CampaignTextField', async () => {
    const blockTitle = await set({
      target: { blockId: 'heroId' },
      field: 'title',
      value: 'x'.repeat(151)
    })
    expect(blockTitle.errors[0]).toMatchObject({
      message: 'title must be at most 150 characters',
      extensions: { code: 'BAD_USER_INPUT', field: 'title' }
    })

    const campaignTitle = await set({
      target: { campaignId: 'campaignId' },
      field: 'title',
      value: 'x'.repeat(101)
    })
    expect(campaignTitle.errors[0]).toMatchObject({
      message: 'title must be at most 100 characters',
      extensions: { code: 'BAD_USER_INPUT', field: 'title' }
    })

    const stringValue = await set({
      target: { stringId: copy.id },
      field: 'value',
      value: 'x'.repeat(201)
    })
    expect(stringValue.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'value'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
    expect(prismaMock.campaignString.update).not.toHaveBeenCalled()
  })

  it('rejects a field the target does not carry (BAD_USER_INPUT, field field)', async () => {
    const result = await set({
      target: { blockId: 'heroId' },
      field: 'content',
      value: 'Hello'
    })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'field'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('rejects the default language and a language the campaign lacks (BAD_USER_INPUT, field languageId)', async () => {
    const defaultLanguage = await set({
      target: { blockId: 'heroId' },
      field: 'title',
      languageId: '529',
      value: 'Hello'
    })
    expect(defaultLanguage.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'languageId'
    })

    const unknown = await set({
      target: { blockId: 'heroId' },
      field: 'title',
      languageId: '21028',
      value: 'Hola'
    })
    expect(unknown.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'languageId'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('requires exactly one target id (BAD_USER_INPUT, field target)', async () => {
    const none = await set({ target: {}, field: 'title', value: 'x' })
    expect(none.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'target'
    })

    const two = await set({
      target: { blockId: 'heroId', campaignId: 'campaignId' },
      field: 'title',
      value: 'x'
    })
    expect(two.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'target'
    })
    expect(prismaMock.campaignBlock.findFirst).not.toHaveBeenCalled()
  })

  it('is NOT_FOUND for a deleted block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await set({
      target: { blockId: 'gone' },
      field: 'title',
      value: 'x'
    })

    expect(result.errors[0]).toMatchObject({
      message: 'block not found',
      extensions: expect.objectContaining({ code: 'NOT_FOUND' })
    })
  })

  it('throws FORBIDDEN for a user outside the team', async () => {
    const outsider = campaignFactory({ userId: 'someoneElse' })
      .withLanguage(FRENCH)
      .build()
    prismaMock.campaignBlock.findFirst.mockResolvedValue({
      ...hero,
      campaign: outsider
    })

    const result = await set({
      target: { blockId: 'heroId' },
      field: 'title',
      value: 'x'
    })

    expect(result.errors[0]).toMatchObject({
      message: 'user is not allowed to update campaign',
      extensions: expect.objectContaining({ code: 'FORBIDDEN' })
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  describe('helpers', () => {
    it('pickTranslationTarget names the one given target', () => {
      expect(pickTranslationTarget({ stringId: 's1' })).toEqual({
        kind: 'string',
        id: 's1'
      })
      expect(() => pickTranslationTarget({})).toThrow()
      expect(() =>
        pickTranslationTarget({ blockId: 'b', regionId: 'r' })
      ).toThrow()
    })

    it('withTranslation sets a human entry, drops it on empty, and tolerates a malformed column', () => {
      expect(withTranslation(null, FRENCH, 'Bonjour')).toEqual({
        [FRENCH]: { value: 'Bonjour', source: 'human' }
      })
      expect(withTranslation([], FRENCH, 'Bonjour')).toEqual({
        [FRENCH]: { value: 'Bonjour', source: 'human' }
      })
      expect(
        withTranslation(
          {
            [FRENCH]: { value: 'Bonjour', source: 'machine' },
            x: { value: 'y', source: 'human' }
          },
          FRENCH,
          ''
        )
      ).toEqual({ x: { value: 'y', source: 'human' } })
    })
  })
})
