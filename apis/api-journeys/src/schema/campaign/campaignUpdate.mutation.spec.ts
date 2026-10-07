import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS
} from './translation/campaignTextField'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignUpdate', () => {
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

  const CAMPAIGN_UPDATE = graphql(`
    mutation CampaignUpdate($id: ID!, $input: CampaignUpdateInput!) {
      campaignUpdate(id: $id, input: $input) {
        id
        title
        slug
      }
    }
  `)

  async function update(input: {
    title?: string
    slug?: string
  }): Promise<any> {
    return await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'campaignId', input }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.campaign.findFirst.mockResolvedValue(null)
  })

  it('updates the title for a member and leaves the slug alone', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.update.mockResolvedValue({
      ...campaign,
      title: 'Easter 2027'
    })

    const result = await update({ title: '  Easter 2027  ' })

    expect(result).toEqual({
      data: {
        campaignUpdate: {
          id: 'campaignId',
          title: 'Easter 2027',
          slug: 'christmas-2026'
        }
      }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaignId' },
        data: { title: 'Easter 2027' }
      })
    )
  })

  it('validates an author-edited slug through the gallery rules and saves it', async () => {
    const campaign = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.update.mockResolvedValue({
      ...campaign,
      slug: 'xmas-2026'
    })

    const result = await update({ slug: ' Xmas 2026 ' })

    expect(result.data.campaignUpdate.slug).toBe('xmas-2026')
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
      where: { slug: 'xmas-2026', NOT: { id: 'campaignId' } },
      select: { id: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { slug: 'xmas-2026' } })
    )
  })

  it('requires a title (BAD_USER_INPUT, field title)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await update({ title: '   ' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'title'
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it('caps the title at 100 characters (BAD_USER_INPUT, field title)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await update({ title: 'x'.repeat(101) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'title'
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it.each([
    ['the pattern', '!!!'],
    ['the length', 'b'.repeat(201)],
    ['the reserved list (campaign)', 'campaign'],
    ['the reserved list (campaigns)', 'campaigns']
  ])(
    'rejects a slug failing %s (BAD_USER_INPUT, field slug)',
    async (_rule, slug) => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ role: 'member' }).build()
      )

      const result = await update({ slug })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'slug'
      })
      expect(prismaMock.campaign.update).not.toHaveBeenCalled()
    }
  )

  it('rejects a slug another campaign already uses (BAD_USER_INPUT, field slug)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaign.findFirst.mockResolvedValue({ id: 'other' } as any)

    const result = await update({ slug: 'taken' })

    expect(result.errors[0]).toMatchObject({
      message: 'slug already in use',
      extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it('surfaces the unique-constraint race on slug as BAD_USER_INPUT, field slug', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaign.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['slug'] }
      })
    )

    const result = await update({ slug: 'raced' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'slug'
    })
  })

  it('does not regenerate the slug when the title changes', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.update.mockResolvedValue({
      ...campaign,
      title: 'Completely different'
    })

    const result = await update({ title: 'Completely different' })

    expect(result.data.campaignUpdate.slug).toBe('christmas-2026')
    expect(prismaMock.campaign.findMany).not.toHaveBeenCalled()
    const { data } = prismaMock.campaign.update.mock.calls[0][0]
    expect(data).not.toHaveProperty('slug')
  })

  it('throws FORBIDDEN for a user outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await update({ title: 'Nope' })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update campaign',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await update({ title: 'Nope' })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'campaign not found',
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
  })

  describe('defaultLanguageId', () => {
    const FRENCH = '496'
    const SPANISH = '21028'

    const CAMPAIGN_SET_DEFAULT = graphql(`
      mutation CampaignSetDefaultLanguage(
        $id: ID!
        $input: CampaignUpdateInput!
      ) {
        campaignUpdate(id: $id, input: $input) {
          id
          defaultLanguageId
        }
      }
    `)

    async function setDefault(defaultLanguageId: string): Promise<any> {
      return await authClient({
        document: CAMPAIGN_SET_DEFAULT,
        variables: { id: 'campaignId', input: { defaultLanguageId } }
      })
    }

    /** Every translatable field of the fixture with a `machine` entry in `languageId`, except those `skip` names. */
    function translatedInto(
      campaign: ReturnType<ReturnType<typeof campaignFactory>['build']>,
      languageId: string,
      skip: { blockId?: string } = {}
    ): typeof campaign {
      const withEntries = <T extends Record<string, any>>(
        record: T,
        caps: Record<string, number>
      ): T => {
        const next: Record<string, any> = { ...record }
        for (const field of Object.keys(caps)) {
          if (typeof record[field] !== 'string' || record[field] === '')
            continue
          next[`${field}Translations`] = {
            ...(record[`${field}Translations`] ?? {}),
            [languageId]: { value: `FR ${record[field]}`, source: 'machine' }
          }
        }
        return next as T
      }
      return {
        ...campaign,
        ...withEntries(campaign, CAMPAIGN_TITLE_TEXT_FIELDS),
        blocks: campaign.blocks.map((block) =>
          block.id === skip.blockId
            ? block
            : withEntries(
                block,
                CAMPAIGN_BLOCK_TEXT_FIELDS[block.typename] ?? {}
              )
        ),
        regions: campaign.regions.map((region) =>
          withEntries(region, CAMPAIGN_REGION_TEXT_FIELDS)
        ),
        strings: campaign.strings.map((string) =>
          withEntries(string, CAMPAIGN_STRING_TEXT_FIELDS)
        )
      }
    }

    beforeEach(() => {
      prismaMock.$transaction.mockImplementation(
        async (callback: any) => await callback(prismaMock)
      )
    })

    it('rejects a language that is not one of the campaign languages (BAD_USER_INPUT, field defaultLanguageId)', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
      )

      const result = await setDefault(SPANISH)

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'defaultLanguageId'
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.campaign.update).not.toHaveBeenCalled()
    })

    it('refuses with CONFLICT and the count while any text lacks the new language', async () => {
      const campaign = campaignFactory({ role: 'member' })
        .withLanguage(FRENCH)
        .build()
      const partial = translatedInto(campaign, FRENCH, { blockId: 'heroId' })
      prismaMock.campaign.findUnique.mockResolvedValue(campaign)
      prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(partial)
      const hero = campaign.blocks.find((block) => block.id === 'heroId')
      const missing = Object.keys(
        CAMPAIGN_BLOCK_TEXT_FIELDS.CampaignHeroBlock
      ).filter((field) => (hero as any)[field]?.trim()).length

      const result = await setDefault(FRENCH)

      expect(missing).toBeGreaterThan(0)
      expect(result.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'defaultLanguageId',
        count: missing
      })
      expect(prismaMock.campaign.update).not.toHaveBeenCalled()
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('swaps every field in one transaction: column text to Translations[oldDefault] as human, the new language to the column, its entry dropped', async () => {
      const campaign = campaignFactory({ role: 'member' })
        .withLanguage(FRENCH)
        .build()
      const complete = translatedInto(campaign, FRENCH)
      prismaMock.campaign.findUnique.mockResolvedValue(campaign)
      prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(complete)
      prismaMock.campaign.update.mockResolvedValue({
        ...complete,
        defaultLanguageId: FRENCH
      })

      const result = await setDefault(FRENCH)

      expect(result).toEqual({
        data: {
          campaignUpdate: { id: 'campaignId', defaultLanguageId: FRENCH }
        }
      })
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'campaignId' },
          data: {
            defaultLanguageId: FRENCH,
            title: `FR ${campaign.title}`,
            titleTranslations: {
              [campaign.defaultLanguageId]: {
                value: campaign.title,
                source: 'human'
              }
            }
          }
        })
      )
      const hero = campaign.blocks.find((block) => block.id === 'heroId')
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroId' },
        data: expect.objectContaining({
          title: `FR ${hero?.title}`,
          titleTranslations: {
            [campaign.defaultLanguageId]: {
              value: hero?.title,
              source: 'human'
            }
          }
        })
      })
      const [firstString] = campaign.strings
      expect(prismaMock.campaignString.update).toHaveBeenCalledWith({
        where: { id: firstString.id },
        data: {
          value: `FR ${firstString.value}`,
          valueTranslations: {
            [campaign.defaultLanguageId]: {
              value: firstString.value,
              source: 'human'
            }
          }
        }
      })
    })

    it('keeps other languages’ entries and leaves fields without text alone', async () => {
      const campaign = campaignFactory({ role: 'member' })
        .withLanguage(FRENCH)
        .withLanguage(SPANISH)
        .build()
      const complete = translatedInto(
        {
          ...campaign,
          title: 'Christmas',
          titleTranslations: {
            [SPANISH]: { value: 'Navidad', source: 'human' }
          }
        },
        FRENCH
      )
      prismaMock.campaign.findUnique.mockResolvedValue(campaign)
      prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(complete)
      prismaMock.campaign.update.mockResolvedValue(complete)

      await setDefault(FRENCH)

      expect(prismaMock.campaign.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titleTranslations: {
              [SPANISH]: { value: 'Navidad', source: 'human' },
              [campaign.defaultLanguageId]: {
                value: 'Christmas',
                source: 'human'
              }
            }
          })
        })
      )
      const updatedBlockIds = prismaMock.campaignBlock.update.mock.calls.map(
        ([args]) => args.where.id
      )
      const textless = campaign.blocks.filter(
        (block) =>
          !Object.keys(CAMPAIGN_BLOCK_TEXT_FIELDS[block.typename] ?? {}).some(
            (field) => (block as any)[field]?.trim()
          )
      )
      expect(textless.length).toBeGreaterThan(0)
      for (const block of textless)
        expect(updatedBlockIds).not.toContain(block.id)
    })

    it('does nothing when the language is already the default', async () => {
      const campaign = campaignFactory({ role: 'member' }).build()
      prismaMock.campaign.findUnique.mockResolvedValue(campaign)
      prismaMock.campaign.update.mockResolvedValue(campaign)

      const result = await setDefault(campaign.defaultLanguageId)

      expect(result.errors).toBeUndefined()
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('throws FORBIDDEN for a user outside the team', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ userId: 'someoneElse' }).withLanguage(FRENCH).build()
      )

      const result = await setDefault(FRENCH)

      expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })
})
