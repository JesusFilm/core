import { GraphQLError } from 'graphql'

import { User } from '@core/yoga/firebaseClient'

import { campaignBlockWithAcl } from '../../../../test/campaignBlockFactory'
import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { INCLUDE_CAMPAIGN_ACL } from '../campaign.acl'

import {
  assertPlacement,
  authorizeBlockCreate,
  authorizeBlockUpdate,
  authorizeTypedBlockUpdate,
  createChildBlock,
  getSiblings,
  removeBlock,
  restoreBlock,
  validateParentBlock
} from './service'

const user = { id: 'userId' } as unknown as User

function errorOf(promise: Promise<unknown>): Promise<GraphQLError> {
  return promise.then(
    () => {
      throw new Error('expected a GraphQLError')
    },
    (error) => error as GraphQLError
  )
}

describe('campaign block service', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const heroButton = fixture.blocks.find(
    (block) => block.id === 'heroButtonId'
  )!

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.update.mockResolvedValue(fixture)
  })

  describe('authorizeBlockCreate', () => {
    it('loads the campaign with INCLUDE_CAMPAIGN_ACL and allows a member', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(fixture)

      await expect(authorizeBlockCreate('campaignId', user)).resolves.toBe(
        fixture
      )
      expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        include: INCLUDE_CAMPAIGN_ACL
      })
    })

    it('throws FORBIDDEN for a caller outside the team', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ userId: 'someoneElse' }).build()
      )

      const error = await errorOf(authorizeBlockCreate('campaignId', user))

      expect(error.extensions.code).toBe('FORBIDDEN')
    })

    it('throws NOT_FOUND for an unknown campaign', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(null)

      const error = await errorOf(authorizeBlockCreate('nope', user))

      expect(error.extensions.code).toBe('NOT_FOUND')
    })
  })

  describe('authorizeBlockUpdate', () => {
    it('authorises through the block’s campaign, never a team-scope call', async () => {
      const block = campaignBlockWithAcl(fixture, 'heroButtonId')
      prismaMock.campaignBlock.findFirst.mockResolvedValue(block)

      await expect(authorizeBlockUpdate('heroButtonId', user)).resolves.toBe(
        block
      )
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: { id: 'heroButtonId', deletedAt: null },
        include: { action: true, campaign: { include: INCLUDE_CAMPAIGN_ACL } }
      })
      expect(prismaMock.userTeam.findFirst).not.toHaveBeenCalled()
      expect(prismaMock.userTeam.findMany).not.toHaveBeenCalled()
    })

    it('throws FORBIDDEN for a caller outside the team', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(
          campaignFactory({ userId: 'someoneElse' }).build(),
          'heroButtonId'
        )
      )

      const error = await errorOf(authorizeBlockUpdate('heroButtonId', user))

      expect(error.extensions.code).toBe('FORBIDDEN')
    })

    it('treats a soft-deleted block as NOT_FOUND unless asked to include it', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const error = await errorOf(authorizeBlockUpdate('heroButtonId', user))

      expect(error.extensions.code).toBe('NOT_FOUND')

      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, 'heroButtonId', {
          deletedAt: new Date()
        })
      )
      await authorizeBlockUpdate('heroButtonId', user, {
        includeDeleted: true
      })
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { id: 'heroButtonId' } })
      )
    })
  })

  describe('authorizeTypedBlockUpdate', () => {
    it('throws NOT_FOUND when the live block has another typename', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, 'heroButtonId')
      )

      const error = await errorOf(
        authorizeTypedBlockUpdate('heroButtonId', user, 'CampaignHeroBlock')
      )

      expect(error.extensions.code).toBe('NOT_FOUND')
    })
  })

  describe('validateParentBlock', () => {
    it('returns a live section of the same campaign', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)

      await expect(
        validateParentBlock('heroId', 'campaignId', 'CampaignTypographyBlock')
      ).resolves.toBe(hero)
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: { id: 'heroId', campaignId: 'campaignId', deletedAt: null }
      })
    })

    it.each(['CampaignHeaderBlock', 'CampaignFooterBlock'])(
      'accepts the chrome block %s as a parent',
      async (typename) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue({
          ...hero,
          id: 'chromeId',
          typename,
          pageId: null
        })

        await expect(
          validateParentBlock('chromeId', 'campaignId', 'CampaignButtonBlock')
        ).resolves.toMatchObject({ typename })
      }
    )

    it('rejects a parent of another campaign or a soft-deleted one (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const error = await errorOf(
        validateParentBlock('heroId', 'otherCampaign', 'CampaignButtonBlock')
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
    })

    it('rejects an Extra as a parent (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(heroButton)

      const error = await errorOf(
        validateParentBlock(
          'heroButtonId',
          'campaignId',
          'CampaignTypographyBlock'
        )
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
    })

    it('rejects any child typename but Typography and Button before querying (BAD_USER_INPUT, typename)', async () => {
      const error = await errorOf(
        validateParentBlock('heroId', 'campaignId', 'CampaignHeroBlock')
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'typename'
      })
      expect(prismaMock.campaignBlock.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('assertPlacement', () => {
    it('defaults to below and accepts above', () => {
      expect(assertPlacement(null)).toBe('below')
      expect(assertPlacement(undefined)).toBe('below')
      expect(assertPlacement('above')).toBe('above')
    })

    it('rejects any other value (BAD_USER_INPUT, placement)', () => {
      expect(() => assertPlacement('sideways')).toThrow(
        expect.objectContaining({
          extensions: { code: 'BAD_USER_INPUT', field: 'placement' }
        })
      )
    })
  })

  describe('getSiblings', () => {
    it('reads a parent’s live ordered children', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([])

      await getSiblings({ ...hero, parentBlockId: hero.id })

      expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaignId',
          parentBlockId: 'heroId',
          parentOrder: { not: null },
          deletedAt: null
        },
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })
    })

    it('reads a top-level block’s siblings from the same page', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([])

      await getSiblings(hero)

      expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parentBlockId: null,
            pageId: 'landingPageId',
            regionId: null
          })
        })
      )
    })
  })

  describe('createChildBlock', () => {
    it('sets parentOrder = siblings.length across above and below and copies the parent scoping down', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([
        { ...heroButton, placement: 'above', parentOrder: 0 },
        { ...heroButton, id: 'otherId', placement: 'below', parentOrder: 1 }
      ])
      prismaMock.campaignBlock.create.mockImplementation((async ({
        data
      }: any) => ({ ...heroButton, ...data })) as never)

      const created = await createChildBlock(prismaMock, hero, {
        typename: 'CampaignTypographyBlock',
        content: '',
        placement: 'above'
      })

      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
        data: {
          typename: 'CampaignTypographyBlock',
          content: '',
          placement: 'above',
          campaignId: 'campaignId',
          pageId: 'landingPageId',
          regionId: null,
          parentBlockId: 'heroId',
          parentOrder: 2
        },
        include: { action: true }
      })
      expect(created.parentOrder).toBe(2)
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })

    it('copies a chrome parent’s null scoping down', async () => {
      const header = fixture.blocks.find((block) => block.id === 'headerId')!
      prismaMock.campaignBlock.findMany.mockResolvedValue([])
      prismaMock.campaignBlock.create.mockResolvedValue(heroButton)

      await createChildBlock(prismaMock, header, {
        typename: 'CampaignButtonBlock',
        label: 'Button',
        placement: 'below'
      })

      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pageId: null,
            regionId: null,
            parentBlockId: 'headerId',
            parentOrder: 0
          })
        })
      )
    })
  })

  describe('removeBlock', () => {
    it('stamps deletedAt and renumbers the remaining siblings contiguously', async () => {
      const first = { ...heroButton, id: 'firstId', parentOrder: 0 }
      const third = { ...heroButton, id: 'thirdId', parentOrder: 2 }
      prismaMock.campaignBlock.update.mockImplementation((async ({
        where,
        data
      }: any) => ({
        ...heroButton,
        id: where.id,
        ...data
      })) as never)
      prismaMock.campaignBlock.findMany.mockResolvedValue([first, third])

      const result = await removeBlock({ ...heroButton, parentOrder: 1 })

      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroButtonId' },
        data: { deletedAt: expect.any(Date) }
      })
      expect(result.map((block) => [block.id, block.parentOrder])).toEqual([
        ['firstId', 0],
        ['thirdId', 1]
      ])
    })
  })

  describe('restoreBlock', () => {
    it('clears deletedAt and re-inserts the block at its parentOrder, renumbering again', async () => {
      const first = { ...heroButton, id: 'firstId', parentOrder: 0 }
      const third = { ...heroButton, id: 'thirdId', parentOrder: 1 }
      prismaMock.campaignBlock.update.mockImplementation((async ({
        where,
        data
      }: any) => ({
        ...heroButton,
        id: where.id,
        parentOrder: where.id === 'heroButtonId' ? 1 : undefined,
        ...data
      })) as never)
      prismaMock.campaignBlock.findMany
        .mockResolvedValueOnce([first, third])
        .mockResolvedValueOnce([])

      const result = await restoreBlock({
        ...heroButton,
        parentOrder: 1,
        deletedAt: new Date()
      })

      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroButtonId' },
        data: { deletedAt: null },
        include: { action: true }
      })
      expect(result.map((block) => [block.id, block.parentOrder])).toEqual([
        ['firstId', 0],
        ['heroButtonId', 1],
        ['thirdId', 2]
      ])
    })

    it('returns the restored block’s live descendants after its siblings', async () => {
      const child = { ...heroButton, id: 'childId', parentBlockId: 'heroId' }
      prismaMock.campaignBlock.update.mockImplementation((async ({
        where,
        data
      }: any) => ({
        ...hero,
        id: where.id,
        ...data
      })) as never)
      prismaMock.campaignBlock.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([child])

      const result = await restoreBlock({ ...hero, deletedAt: new Date() })

      expect(result.map((block) => block.id)).toEqual(['heroId', 'childId'])
    })
  })
})
