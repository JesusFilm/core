import { GraphQLError } from 'graphql'

import { CampaignAction, Prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { campaignBlockWithAcl } from '../../../../test/campaignBlockAcl'
import { mockCampaignBlockWrites } from '../../../../test/campaignBlockWrites'
import {
  CampaignBlockRow,
  campaignFactory
} from '../../../../test/campaignFactory'
import { expectStructureLockFirst } from '../../../../test/campaignStructureLock'
import { prismaMock } from '../../../../test/prismaMock'
import { INCLUDE_CAMPAIGN_ACL } from '../campaign.acl'
import { CAMPAIGN_BLOCKS_MAX } from '../validation'

import {
  assertImageSlot,
  assertMediaOwner,
  assertPlacement,
  assertTopLevelScope,
  authorizeBlockCreate,
  authorizeBlockUpdate,
  authorizeStructuralBlock,
  authorizeTypedBlockUpdate,
  collectSubtree,
  createChildBlock,
  createColumnsSection,
  createOwnedBlock,
  createOwnedImageBlock,
  createRegionLine,
  createSlotChild,
  createTopLevelBlock,
  duplicateBlock,
  getSiblings,
  removeBlock,
  reorderBlock,
  restoreBlock,
  sectionStyleColumns,
  swapSlot,
  updateBlock,
  validateParentBlock,
  validateRegion,
  validateSectionPage,
  validateSlotOwner,
  validateSlotParent,
  validateSlotTarget
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

const HERO_COPY_ID = 'dba93414-2864-41ed-801d-43f535a9e73e'
const HERO_MEDIA_COPY_ID = '1f4216be-2642-4f2d-a4a7-7512e06bda00'
const COLUMNS_COPY_ID = 'f594bc44-c5a8-480d-b7ea-cbd7a72e98f5'
const SLOT_LEFT_COPY_ID = 'c0766f79-1f71-495f-b289-b8708e0222c7'
const SLOT_RIGHT_COPY_ID = '42850655-d582-4511-9770-f3c69a746f54'
const SLOT_HERO_COPY_ID = 'e55e9041-3b12-4000-b0f4-496845a0c5ee'
const SLOT_BUTTON_COPY_ID = 'a5220e28-1889-4952-9c39-b272e1cb9f8c'

describe('authorization', () => {
  const fixture = campaignFactory().build()

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

  describe('authorizeStructuralBlock', () => {
    it.each(['headerId', 'footerId'])(
      'refuses the chrome block %s (CONFLICT, id)',
      async (id) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue(
          campaignBlockWithAcl(fixture, id)
        )

        const error = await errorOf(
          authorizeStructuralBlock(id, user, 'deleted')
        )

        expect(error.extensions).toMatchObject({
          code: 'CONFLICT',
          field: 'id'
        })
      }
    )

    it.each(['deleted', 'duplicated'] as const)(
      'refuses a column slot that is %s (CONFLICT, id)',
      async (verb) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue(
          campaignBlockWithAcl(fixture, 'heroId', {
            id: 'slotId',
            typename: 'CampaignColumnBlock'
          })
        )

        const error = await errorOf(
          authorizeStructuralBlock('slotId', user, verb)
        )

        expect(error.extensions).toMatchObject({
          code: 'CONFLICT',
          field: 'id'
        })
      }
    )

    it('lets a column slot be moved: swapping the two slots is an order update', async () => {
      const slot = campaignBlockWithAcl(fixture, 'heroId', {
        id: 'slotId',
        typename: 'CampaignColumnBlock'
      })
      prismaMock.campaignBlock.findFirst.mockResolvedValue(slot)

      await expect(
        authorizeStructuralBlock('slotId', user, 'moved')
      ).resolves.toBe(slot)
    })

    it('tells a page id apart from an unknown id and refuses it (CONFLICT, id)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)
      const {
        team,
        languages,
        theme,
        pages,
        blocks,
        regions,
        strings,
        ...row
      } = fixture
      prismaMock.campaignPage.findUnique.mockResolvedValue({
        ...pages[1],
        campaign: { ...row, team }
      } as never)

      const error = await errorOf(
        authorizeStructuralBlock('regionPageId', user, 'duplicated')
      )

      expect(error.extensions).toMatchObject({ code: 'CONFLICT', field: 'id' })
      expect(prismaMock.campaignPage.findUnique).toHaveBeenCalledWith({
        where: { id: 'regionPageId' },
        include: { campaign: { include: INCLUDE_CAMPAIGN_ACL } }
      })
    })

    it('throws FORBIDDEN for a page of another team’s campaign, not CONFLICT', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)
      const other = campaignFactory({ userId: 'someoneElse' }).build()
      const {
        team,
        languages,
        theme,
        pages,
        blocks,
        regions,
        strings,
        ...row
      } = other
      prismaMock.campaignPage.findUnique.mockResolvedValue({
        ...pages[0],
        campaign: { ...row, team }
      } as never)

      const error = await errorOf(
        authorizeStructuralBlock('landingPageId', user, 'deleted')
      )

      expect(error.extensions.code).toBe('FORBIDDEN')
    })

    it('throws NOT_FOUND when neither a live block nor a page has the id', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)
      prismaMock.campaignPage.findUnique.mockResolvedValue(null)

      const error = await errorOf(
        authorizeStructuralBlock('nope', user, 'deleted')
      )

      expect(error.extensions.code).toBe('NOT_FOUND')
    })

    it('returns a live section for a member', async () => {
      const block = campaignBlockWithAcl(fixture, 'heroId')
      prismaMock.campaignBlock.findFirst.mockResolvedValue(block)

      await expect(
        authorizeStructuralBlock('heroId', user, 'moved')
      ).resolves.toBe(block)
    })
  })
})

describe('typename predicates and validators', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const heroButton = fixture.blocks.find(
    (block) => block.id === 'heroButtonId'
  )!
  const header = fixture.blocks.find((block) => block.id === 'headerId')!

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.update.mockResolvedValue(fixture)
  })

  describe('validateParentBlock', () => {
    it('returns a live section of the same campaign', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)

      await expect(
        validateParentBlock('heroId', 'campaignId', 'CampaignTypographyBlock')
      ).resolves.toBe(hero)
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'heroId',
          campaignId: 'campaignId',
          deletedAt: null,
          parentOrder: { not: null }
        }
      })
    })

    it('refuses an owned image (parentOrder null) as a host: the lookup excludes it (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const error = await errorOf(
        validateParentBlock('coverId', 'campaignId', 'CampaignButtonBlock')
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: 'coverId',
          parentOrder: { not: null }
        })
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

  describe('validateSlotOwner', () => {
    it('returns a live section or chrome block of the campaign', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(header)

      await expect(validateSlotOwner('headerId', 'campaignId')).resolves.toBe(
        header
      )
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'headerId',
          campaignId: 'campaignId',
          deletedAt: null,
          parentOrder: { not: null }
        }
      })
    })

    it('refuses an owned image (parentOrder null) as a cover owner: the lookup excludes it (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const error = await errorOf(validateSlotOwner('coverId', 'campaignId'))

      expect(error.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: 'coverId',
          parentOrder: { not: null }
        })
      })
    })

    it('rejects an Extra or a missing block (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(
        fixture.blocks.find((block) => block.id === 'heroButtonId')!
      )
      const extra = await errorOf(
        validateSlotOwner('heroButtonId', 'campaignId')
      )
      expect(extra.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })

      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(null)
      const missing = await errorOf(validateSlotOwner('nope', 'campaignId'))
      expect(missing.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
    })
  })

  describe('validateSectionPage', () => {
    it('returns a page of the campaign', async () => {
      prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[1])

      await expect(
        validateSectionPage(
          'campaignId',
          'regionPageId',
          'CampaignRegionShareBlock'
        )
      ).resolves.toBe(fixture.pages[1])
      expect(prismaMock.campaignPage.findFirst).toHaveBeenCalledWith({
        where: { id: 'regionPageId', campaignId: 'campaignId' }
      })
    })

    it.each(['CampaignRegionHeaderBlock', 'CampaignRegionShareBlock'])(
      'rejects %s on the landing page (BAD_USER_INPUT, pageId)',
      async (typename) => {
        prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[0])

        const error = await errorOf(
          validateSectionPage('campaignId', 'landingPageId', typename)
        )

        expect(error.extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: 'pageId'
        })
      }
    )

    it('rejects a page of another campaign (BAD_USER_INPUT, pageId)', async () => {
      prismaMock.campaignPage.findFirst.mockResolvedValue(null)

      const error = await errorOf(
        validateSectionPage(
          'otherCampaign',
          'landingPageId',
          'CampaignHeroBlock'
        )
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'pageId'
      })
    })
  })

  describe('validateRegion', () => {
    it('returns a region of the campaign', async () => {
      const region = campaignFactory().withRegion('EUR').build().regions[0]
      prismaMock.campaignRegion.findFirst.mockResolvedValue(region)

      await expect(validateRegion('eurRegionId', 'campaignId')).resolves.toBe(
        region
      )
      expect(prismaMock.campaignRegion.findFirst).toHaveBeenCalledWith({
        where: { id: 'eurRegionId', campaignId: 'campaignId' }
      })
    })

    it('rejects a region of another campaign (BAD_USER_INPUT, regionId)', async () => {
      prismaMock.campaignRegion.findFirst.mockResolvedValue(null)

      const error = await errorOf(validateRegion('eurRegionId', 'campaignId'))

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'regionId'
      })
    })
  })

  describe('validateSlotParent', () => {
    const page = fixture.pages[0]
    const slot = {
      ...hero,
      id: 'slotId',
      typename: 'CampaignColumnBlock',
      parentBlockId: 'columnsId',
      parentOrder: 0
    }

    it('returns a live slot of a live Columns section on the same page', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(slot)

      await expect(
        validateSlotParent('slotId', 'campaignId', page, 'CampaignHeroBlock')
      ).resolves.toBe(slot)
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'slotId',
          campaignId: 'campaignId',
          pageId: page.id,
          typename: 'CampaignColumnBlock',
          deletedAt: null,
          parentBlock: { is: { deletedAt: null } }
        }
      })
    })

    it('refuses a parent that is not such a slot (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const error = await errorOf(
        validateSlotParent('heroId', 'campaignId', page, 'CampaignHeroBlock')
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
    })

    it.each(['CampaignColumnsBlock', 'CampaignRegionShareBlock'])(
      'never takes a %s in a slot (BAD_USER_INPUT, parentBlockId)',
      async (typename) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue(slot)

        const error = await errorOf(
          validateSlotParent('slotId', 'campaignId', page, typename)
        )

        expect(error.extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: 'parentBlockId'
        })
      }
    )

    it.each([
      'CampaignHeroBlock',
      'CampaignRegionSwitcherBlock',
      'CampaignVideoCarouselBlock',
      'CampaignJourneyListBlock',
      'CampaignAnalyticsBlock',
      'CampaignRegionHeaderBlock',
      'CampaignRichTextBlock'
    ])('takes a %s in a slot', async (typename) => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(slot)

      await expect(
        validateSlotParent('slotId', 'campaignId', page, typename)
      ).resolves.toBe(slot)
    })

    it('still refuses a region-only section on the landing page inside a slot (BAD_USER_INPUT, pageId)', async () => {
      prismaMock.campaignPage.findFirst.mockResolvedValue(page)

      const error = await errorOf(
        validateSectionPage('campaignId', page.id, 'CampaignRegionHeaderBlock')
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'pageId'
      })
    })
  })

  describe('assertPlacement', () => {
    it('leaves an omitted placement to the column default and accepts above', () => {
      expect(assertPlacement(null)).toBeUndefined()
      expect(assertPlacement(undefined)).toBeUndefined()
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

  describe('assertTopLevelScope', () => {
    it('accepts a page-scoped section, a region-scoped line and unscoped chrome', () => {
      expect(() =>
        assertTopLevelScope('CampaignHeroBlock', {
          pageId: 'landingPageId',
          regionId: null
        })
      ).not.toThrow()
      expect(() =>
        assertTopLevelScope('CampaignTypographyBlock', {
          pageId: null,
          regionId: 'eurRegionId'
        })
      ).not.toThrow()
      expect(() =>
        assertTopLevelScope('CampaignHeaderBlock', {
          pageId: null,
          regionId: null
        })
      ).not.toThrow()
    })

    it('rejects both pageId and regionId on a top-level block (BAD_USER_INPUT, pageId)', () => {
      expect(() =>
        assertTopLevelScope('CampaignHeroBlock', {
          pageId: 'landingPageId',
          regionId: 'eurRegionId'
        })
      ).toThrow(
        expect.objectContaining({
          extensions: { code: 'BAD_USER_INPUT', field: 'pageId' }
        })
      )
    })

    it('rejects a section with neither (BAD_USER_INPUT, pageId)', () => {
      expect(() =>
        assertTopLevelScope('CampaignHeroBlock', {
          pageId: null,
          regionId: null
        })
      ).toThrow(
        expect.objectContaining({
          extensions: { code: 'BAD_USER_INPUT', field: 'pageId' }
        })
      )
    })

    it.each(['CampaignHeaderBlock', 'CampaignFooterBlock'])(
      'rejects %s scoped to a page or region (BAD_USER_INPUT, pageId)',
      (typename) => {
        expect(() =>
          assertTopLevelScope(typename, {
            pageId: 'landingPageId',
            regionId: null
          })
        ).toThrow(
          expect.objectContaining({
            extensions: { code: 'BAD_USER_INPUT', field: 'pageId' }
          })
        )
        expect(() =>
          assertTopLevelScope(typename, {
            pageId: null,
            regionId: 'eurRegionId'
          })
        ).toThrow(
          expect.objectContaining({
            extensions: { code: 'BAD_USER_INPUT', field: 'pageId' }
          })
        )
      }
    )
  })
})

describe('tree order and creates', () => {
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
        orderBy: [{ parentOrder: 'asc' }, { id: 'asc' }],
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
      mockCampaignBlockWrites(heroButton)

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

  describe('createTopLevelBlock', () => {
    it.each(['CampaignHeaderBlock', 'CampaignFooterBlock'])(
      'refuses a second %s (CONFLICT, typename)',
      async (typename) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue({
          id: typename === 'CampaignHeaderBlock' ? 'headerId' : 'footerId'
        } as never)

        const error = await errorOf(
          createTopLevelBlock(
            prismaMock,
            { campaignId: 'campaignId', pageId: null, regionId: null },
            { typename }
          )
        )

        expect(error.extensions).toMatchObject({
          code: 'CONFLICT',
          field: 'typename'
        })
        expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
          where: { campaignId: 'campaignId', typename, deletedAt: null },
          select: { id: true }
        })
        expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
      }
    )

    it('creates chrome when none exists yet, unscoped and last among the chrome rows', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)
      prismaMock.campaignBlock.findMany.mockResolvedValue([
        fixture.blocks.find((block) => block.id === 'headerId')!
      ])
      mockCampaignBlockWrites(hero)

      const created = await createTopLevelBlock(
        prismaMock,
        { campaignId: 'campaignId', pageId: null, regionId: null },
        { typename: 'CampaignFooterBlock' }
      )

      expect(created).toMatchObject({
        typename: 'CampaignFooterBlock',
        pageId: null,
        regionId: null,
        parentBlockId: null,
        parentOrder: 1
      })
    })

    it('inserts a section at the requested position and renumbers the later siblings', async () => {
      const sections = fixture.blocks.filter(
        (block) =>
          block.pageId === 'landingPageId' && block.parentBlockId == null
      )
      prismaMock.campaignBlock.findMany.mockResolvedValue(sections)
      mockCampaignBlockWrites(hero, { createdId: 'newId' })

      const created = await createTopLevelBlock(
        prismaMock,
        { campaignId: 'campaignId', pageId: 'landingPageId', regionId: null },
        { typename: 'CampaignAnalyticsBlock' },
        2
      )

      expect(created).toMatchObject({ id: 'newId', parentOrder: 2 })
      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]) => [
          call.where.id,
          call.data.parentOrder
        ])
      ).toEqual([
        ['heroId', 0],
        ['landingSwitcherId', 1],
        ['newId', 2],
        ['carouselId', 3],
        ['landingJourneyListId', 4],
        ['landingAnalyticsId', 5]
      ])
    })
  })

  describe('createRegionLine', () => {
    it('creates exactly a Typography block scoped to the region, with pageId, parentBlockId and placement null and parentOrder = line order', async () => {
      const region = campaignFactory().withRegion('EUR').build().regions[0]
      const existingLine = {
        ...hero,
        id: 'eurLineId',
        typename: 'CampaignTypographyBlock',
        pageId: null,
        regionId: 'eurRegionId',
        parentOrder: 0
      }
      prismaMock.campaignBlock.findMany.mockResolvedValue([existingLine])
      mockCampaignBlockWrites(hero, { createdId: 'newLineId' })

      const line = await createRegionLine(prismaMock, region, {
        typename: 'CampaignTypographyBlock',
        content: 'EUR',
        placement: 'above'
      })

      expect(line).toMatchObject({
        id: 'newLineId',
        typename: 'CampaignTypographyBlock',
        campaignId: 'campaignId',
        pageId: null,
        regionId: 'eurRegionId',
        parentBlockId: null,
        parentOrder: 1,
        placement: null,
        content: 'EUR'
      })
      expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            campaignId: 'campaignId',
            parentBlockId: null,
            pageId: null,
            regionId: 'eurRegionId',
            deletedAt: null
          })
        })
      )
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
        data: {
          typename: 'CampaignTypographyBlock',
          content: 'EUR',
          placement: null,
          campaignId: 'campaignId',
          pageId: null,
          regionId: 'eurRegionId',
          parentBlockId: null,
          parentOrder: 1
        },
        include: { action: true }
      })
    })
  })

  describe('createColumnsSection', () => {
    it('creates the section and exactly two slots at parentOrder 0 and 1', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([])
      prismaMock.campaignBlock.create.mockResolvedValue({
        ...hero,
        id: 'columnsId',
        typename: 'CampaignColumnsBlock',
        parentOrder: 0
      })

      const section = await createColumnsSection(prismaMock, fixture.pages[0], {
        typename: 'CampaignColumnsBlock'
      })

      expect(section.id).toBe('columnsId')
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(3)
      expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          typename: 'CampaignColumnBlock',
          parentBlockId: 'columnsId',
          parentOrder: 0
        })
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(3, {
        data: expect.objectContaining({
          typename: 'CampaignColumnBlock',
          parentBlockId: 'columnsId',
          parentOrder: 1
        })
      })
    })
  })

  describe('createSlotChild', () => {
    const slot = {
      ...hero,
      id: 'slotId',
      typename: 'CampaignColumnBlock',
      parentBlockId: 'columnsId',
      parentOrder: 0
    }

    it('creates the slot’s only section at parentOrder 0 with the slot’s scoping', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([])
      prismaMock.campaignBlock.create.mockResolvedValue({
        ...hero,
        parentBlockId: 'slotId',
        parentOrder: 0
      })

      await createSlotChild(prismaMock, slot, {
        typename: 'CampaignHeroBlock'
      })

      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          typename: 'CampaignHeroBlock',
          campaignId: slot.campaignId,
          pageId: slot.pageId,
          parentBlockId: 'slotId',
          parentOrder: 0
        }),
        include: { action: true }
      })
    })

    it('refuses a slot that already holds a live section (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([
        { ...hero, parentBlockId: 'slotId', parentOrder: 0 }
      ])

      const error = await errorOf(
        createSlotChild(prismaMock, slot, { typename: 'CampaignHeroBlock' })
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
      expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parentBlockId: 'slotId',
            deletedAt: null
          })
        })
      )
    })
  })

  describe('Video Carousel items', () => {
    const carousel = fixture.blocks.find((block) => block.id === 'carouselId')!
    function item(id: string, parentOrder: number): CampaignBlockRow {
      return {
        ...carousel,
        id,
        typename: 'CampaignVideoBlock',
        parentBlockId: 'carouselId',
        parentOrder,
        source: 'youTube',
        videoId: id,
        action: null
      }
    }

    it('takes a CampaignVideoBlock as an ordered child of a carousel', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(carousel)

      await expect(
        validateParentBlock('carouselId', 'campaignId', 'CampaignVideoBlock')
      ).resolves.toBe(carousel)
    })

    it('still takes Extras on a carousel', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(carousel)

      await expect(
        validateParentBlock('carouselId', 'campaignId', 'CampaignButtonBlock')
      ).resolves.toBe(carousel)
    })

    it.each([
      'CampaignImageBlock',
      'CampaignJourneyBlock',
      'CampaignHeroBlock'
    ])(
      'refuses %s as a child of a carousel (BAD_USER_INPUT, typename)',
      async (typename) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue(carousel)

        const error = await errorOf(
          validateParentBlock('carouselId', 'campaignId', typename)
        )

        expect(error.extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: 'typename'
        })
      }
    )

    it('refuses a CampaignVideoBlock item under any section but a carousel (BAD_USER_INPUT, typename)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)

      const error = await errorOf(
        validateParentBlock('heroId', 'campaignId', 'CampaignVideoBlock')
      )

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'typename'
      })
    })

    it('appends a new item after the carousel’s children by parentOrder', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([
        item('firstId', 0),
        item('secondId', 1)
      ])
      mockCampaignBlockWrites({})

      const created = await createChildBlock(prismaMock, carousel, {
        typename: 'CampaignVideoBlock',
        source: 'youTube',
        videoId: 'thirdId'
      })

      expect(created).toMatchObject({
        parentBlockId: 'carouselId',
        parentOrder: 2,
        pageId: 'landingPageId'
      })
    })

    it('reorders an item among the carousel’s children, as campaignBlockOrderUpdate does', async () => {
      const items = [
        item('firstId', 0),
        item('secondId', 1),
        item('thirdId', 2)
      ]
      prismaMock.campaignBlock.findMany.mockResolvedValue(items)
      mockCampaignBlockWrites({}, { blocks: items })

      const siblings = await reorderBlock(items[2], 1)

      expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ parentBlockId: 'carouselId' }),
          orderBy: [{ parentOrder: 'asc' }, { id: 'asc' }]
        })
      )
      expect(
        siblings.map((sibling) => [sibling.id, sibling.parentOrder])
      ).toEqual([
        ['firstId', 0],
        ['thirdId', 1],
        ['secondId', 2]
      ])
    })

    it('refuses a placement on an item (BAD_USER_INPUT, placement)', async () => {
      const error = await errorOf(reorderBlock(item('firstId', 0), 1, 'above'))

      expect(error.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'placement'
      })
    })
  })
})

describe('delete, restore and duplicate', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const heroButton = fixture.blocks.find(
    (block) => block.id === 'heroButtonId'
  )!

  describe('removeBlock', () => {
    beforeEach(() => {
      prismaMock.$transaction.mockImplementation(
        async (callback: any) => await callback(prismaMock)
      )
      prismaMock.campaign.update.mockResolvedValue(fixture)
    })

    it('stamps deletedAt and renumbers the remaining siblings contiguously', async () => {
      const first = { ...heroButton, id: 'firstId', parentOrder: 0 }
      const third = { ...heroButton, id: 'thirdId', parentOrder: 2 }
      mockCampaignBlockWrites(heroButton)
      prismaMock.campaignBlock.findMany
        .mockResolvedValueOnce([first, heroButton, third])
        .mockResolvedValueOnce([first, third])

      const result = await removeBlock({ ...heroButton, parentOrder: 1 })

      expect(prismaMock.campaignBlock.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['heroButtonId'] }, deletedAt: null },
        data: { deletedAt: expect.any(Date) }
      })
      expect(result.map((block) => [block.id, block.parentOrder])).toEqual([
        ['firstId', 0],
        ['thirdId', 1]
      ])
    })

    it('stamps the live descendants and owned blocks in the same write', async () => {
      const child = { ...heroButton, id: 'childId', parentBlockId: 'heroId' }
      const owned = { ...heroButton, id: 'ownedId', parentOrder: null }
      const unrelated = {
        ...heroButton,
        id: 'unrelatedId',
        parentBlockId: 'otherId'
      }
      prismaMock.campaignBlock.findMany
        .mockResolvedValueOnce([
          { ...hero, coverBlockId: 'ownedId' },
          child,
          owned,
          unrelated
        ])
        .mockResolvedValueOnce([])

      await removeBlock({ ...hero, parentOrder: 0 })

      const { where } = prismaMock.campaignBlock.updateMany.mock.calls[0][0]
      expect((where!.id as { in: string[] }).in.sort()).toEqual([
        'childId',
        'heroId',
        'ownedId'
      ])
      expect(where!.deletedAt).toBeNull()
    })
  })

  describe('restoreBlock', () => {
    describe('reinserting the block and the rows deleted with it', () => {
      beforeEach(() => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
        prismaMock.campaign.update.mockResolvedValue(fixture)
      })

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

      it('clears deletedAt on the rows deleted with the block, matched by timestamp', async () => {
        const deletedAt = new Date('2026-10-01T00:00:00.000Z')
        mockCampaignBlockWrites(hero)
        prismaMock.campaignBlock.findMany
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([])

        await restoreBlock({ ...hero, deletedAt })

        expect(prismaMock.campaignBlock.updateMany).toHaveBeenCalledWith({
          where: {
            campaignId: hero.campaignId,
            deletedAt,
            id: { not: 'heroId' }
          },
          data: { deletedAt: null }
        })
      })

      it('returns the restored block’s live descendants after its siblings', async () => {
        const child = { ...heroButton, id: 'childId', parentBlockId: 'heroId' }
        mockCampaignBlockWrites(hero)
        prismaMock.campaignBlock.findMany
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([child])

        const result = await restoreBlock({ ...hero, deletedAt: new Date() })

        expect(result.map((block) => block.id)).toEqual(['heroId', 'childId'])
      })
    })

    describe('under a deleted parent', () => {
      beforeEach(() => {
        prismaMock.$transaction.mockImplementation(
          async (callback: any) => await callback(prismaMock)
        )
      })

      it('is refused until the section is restored first (CONFLICT, id), before any write', async () => {
        prismaMock.campaignBlock.count.mockResolvedValue(1)

        const error = await errorOf(
          restoreBlock({ ...heroButton, deletedAt: new Date() })
        )

        expect(error.message).toBe('restore the section first')
        expect(error.extensions).toEqual({ code: 'CONFLICT', field: 'id' })
        expect(prismaMock.campaignBlock.count).toHaveBeenCalledWith({
          where: { id: 'heroId', deletedAt: { not: null } }
        })
        expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
        expect(prismaMock.campaignBlock.updateMany).not.toHaveBeenCalled()
      })

      it('refuses an owned block (CONFLICT, id): it comes back through its slot', async () => {
        const error = await errorOf(
          restoreBlock({
            ...heroButton,
            id: 'oldCoverId',
            typename: 'CampaignImageBlock',
            parentOrder: null,
            deletedAt: new Date()
          })
        )

        expect(error.message).toBe('an owned block comes back through its slot')
        expect(error.extensions).toEqual({ code: 'CONFLICT', field: 'id' })
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
      })

      it('does not look for a parent on a top-level block', async () => {
        prismaMock.campaignBlock.update.mockResolvedValue({
          ...heroButton,
          parentBlockId: null,
          parentOrder: 0
        })
        prismaMock.campaignBlock.findMany.mockResolvedValue([])

        await restoreBlock({
          ...heroButton,
          parentBlockId: null,
          parentOrder: 0,
          deletedAt: new Date()
        })

        expect(prismaMock.campaignBlock.count).not.toHaveBeenCalledWith({
          where: expect.objectContaining({ deletedAt: { not: null } })
        })
      })
    })
  })

  describe('duplicateBlock', () => {
    beforeEach(() => {
      prismaMock.$transaction.mockImplementation(
        async (callback: any) => await callback(prismaMock)
      )
      prismaMock.campaign.update.mockResolvedValue(fixture)
    })

    function row(
      id: string,
      typename: string,
      parentBlockId: string | null,
      parentOrder: number | null,
      overrides: Partial<CampaignBlockRow> = {}
    ): CampaignBlockRow {
      return {
        ...hero,
        id,
        typename,
        parentBlockId,
        parentOrder,
        pageId: 'landingPageId',
        coverBlockId: null,
        mediaBlockId: null,
        logoBlockId: null,
        action: null,
        ...overrides
      }
    }

    function actionTo(
      campaignBlockId: string,
      target: Partial<CampaignAction>
    ): CampaignAction {
      return {
        campaignBlockId,
        blockId: null,
        regionId: null,
        url: null,
        target: null,
        updatedAt: new Date(),
        ...target
      }
    }

    /** The mocked transaction: `live` for the subtree read, the roots for the siblings. */
    function setLive(live: CampaignBlockRow[]): void {
      prismaMock.campaignBlock.findMany
        .mockResolvedValueOnce(live)
        .mockResolvedValueOnce(
          live.filter(
            (block) => block.parentBlockId == null && block.parentOrder != null
          )
        )
      mockCampaignBlockWrites(hero)
      // A copied action is written with its row (`action: { create }`) and read back with it.
      prismaMock.campaignBlock.update.mockImplementation((async ({
        where,
        data
      }: {
        where: { id: string }
        data: Prisma.CampaignBlockUncheckedUpdateInput & {
          action?: { create: Partial<CampaignAction> }
        }
      }) => {
        const { action, ...columns } = data
        return {
          ...hero,
          id: where.id,
          ...columns,
          action: action != null ? actionTo(where.id, action.create) : null
        }
      }) as never)
    }

    /** The copy of `oldId` as the mocked `create` wrote it. */
    function createdData(
      newId: string
    ): Prisma.CampaignBlockUncheckedCreateInput {
      const call = prismaMock.campaignBlock.create.mock.calls.find(
        ([args]) => args.data.id === newId
      )
      if (call == null) throw new Error(`${newId} was never created`)
      return call[0].data as Prisma.CampaignBlockUncheckedCreateInput
    }

    /** What `update` wrote to the copy `newId` besides the sibling renumbering. */
    function patchedData(newId: string): Record<string, unknown> | undefined {
      return prismaMock.campaignBlock.update.mock.calls.find(
        ([args]) => args.where.id === newId && !('parentOrder' in args.data)
      )?.[0].data
    }

    const idMap = [
      { oldId: 'columnsId', newId: COLUMNS_COPY_ID },
      { oldId: 'slotLeftId', newId: SLOT_LEFT_COPY_ID },
      { oldId: 'slotRightId', newId: SLOT_RIGHT_COPY_ID },
      { oldId: 'slotHeroId', newId: SLOT_HERO_COPY_ID },
      { oldId: 'slotButtonId', newId: SLOT_BUTTON_COPY_ID }
    ]

    const columnsSection = [
      row('columnsId', 'CampaignColumnsBlock', null, 0),
      row('slotLeftId', 'CampaignColumnBlock', 'columnsId', 0),
      row('slotRightId', 'CampaignColumnBlock', 'columnsId', 1),
      row('slotHeroId', 'CampaignHeroBlock', 'slotLeftId', 0),
      row('slotButtonId', 'CampaignButtonBlock', 'slotHeroId', 0)
    ]

    it('copies parents before children', async () => {
      // The live list is deliberately not in tree order: a child read before its parent.
      setLive([...columnsSection].reverse())

      await duplicateBlock(columnsSection[0], idMap)

      const created = prismaMock.campaignBlock.create.mock.calls.map(
        ([args]) => args.data
      )
      expect(created.map((data) => data.id)).toHaveLength(5)
      expect(created[0].id).toBe(COLUMNS_COPY_ID)
      const seen = new Set<string>()
      for (const data of created) {
        if (data.id !== COLUMNS_COPY_ID)
          expect(seen).toContain(data.parentBlockId)
        seen.add(data.id as string)
      }
    })

    it('puts a copied column slot’s children in the copied slot, not the original', async () => {
      setLive(columnsSection)

      await duplicateBlock(columnsSection[0], idMap)

      expect(createdData(SLOT_LEFT_COPY_ID).parentBlockId).toBe(COLUMNS_COPY_ID)
      expect(createdData(SLOT_RIGHT_COPY_ID).parentBlockId).toBe(
        COLUMNS_COPY_ID
      )
      expect(createdData(SLOT_HERO_COPY_ID).parentBlockId).toBe(
        SLOT_LEFT_COPY_ID
      )
      expect(createdData(SLOT_BUTTON_COPY_ID).parentBlockId).toBe(
        SLOT_HERO_COPY_ID
      )
    })

    it('retargets a copied action at the copied block, and leaves one aimed outside the subtree alone', async () => {
      const withActions = columnsSection.map((block) => {
        if (block.id === 'slotHeroId')
          return {
            ...block,
            action: actionTo('slotHeroId', { blockId: 'slotRightId' })
          }
        if (block.id === 'slotButtonId')
          return {
            ...block,
            action: actionTo('slotButtonId', {
              blockId: 'outsideBlockId',
              regionId: 'regionId'
            })
          }
        return block
      })
      setLive(withActions)

      await duplicateBlock(columnsSection[0], idMap)

      expect(patchedData(SLOT_HERO_COPY_ID)).toEqual({
        action: {
          create: {
            blockId: SLOT_RIGHT_COPY_ID,
            regionId: null,
            url: null,
            target: null
          }
        }
      })
      expect(patchedData(SLOT_BUTTON_COPY_ID)).toEqual({
        action: {
          create: {
            blockId: 'outsideBlockId',
            regionId: 'regionId',
            url: null,
            target: null
          }
        }
      })
    })

    it('copies owned blocks under the copied owner and points the slot columns at them', async () => {
      const owned = row(
        'heroMediaId',
        'CampaignTypographyBlock',
        'heroId',
        null
      )
      setLive([
        row('heroId', 'CampaignHeroBlock', null, 0, {
          mediaBlockId: 'heroMediaId'
        }),
        owned
      ])

      await duplicateBlock(hero, [
        { oldId: 'heroId', newId: HERO_COPY_ID },
        { oldId: 'heroMediaId', newId: HERO_MEDIA_COPY_ID }
      ])

      expect(createdData(HERO_MEDIA_COPY_ID)).toMatchObject({
        parentBlockId: HERO_COPY_ID,
        parentOrder: null
      })
      expect(createdData(HERO_COPY_ID)).not.toHaveProperty('mediaBlockId')
      expect(patchedData(HERO_COPY_ID)).toEqual({
        mediaBlockId: HERO_MEDIA_COPY_ID
      })
    })

    it('returns the renumbered siblings with the copy after the original, then every copied descendant', async () => {
      setLive([
        ...columnsSection,
        row('footerSectionId', 'CampaignHeroBlock', null, 1)
      ])

      const result = await duplicateBlock(columnsSection[0], idMap)

      expect(result.map((block) => block.id)).toEqual([
        'columnsId',
        COLUMNS_COPY_ID,
        'footerSectionId',
        SLOT_LEFT_COPY_ID,
        SLOT_RIGHT_COPY_ID,
        SLOT_HERO_COPY_ID,
        SLOT_BUTTON_COPY_ID
      ])
    })

    it('gives every copied block a fresh id, the idMap ones as asked, and covers the whole subtree', async () => {
      setLive(columnsSection)

      const result = await duplicateBlock(columnsSection[0], [
        { oldId: 'columnsId', newId: COLUMNS_COPY_ID }
      ])

      const copiedIds = result
        .map((block) => block.id)
        .filter((id) => !columnsSection.some((block) => block.id === id))
      expect(copiedIds).toHaveLength(columnsSection.length)
      expect(copiedIds).toContain(COLUMNS_COPY_ID)
      expect(new Set(copiedIds).size).toBe(columnsSection.length)
    })

    it('refuses an owned block on its own (CONFLICT, id)', async () => {
      const error = await errorOf(
        duplicateBlock(
          row('ownedId', 'CampaignTypographyBlock', 'heroId', null)
        )
      )

      expect(error.extensions).toEqual({ code: 'CONFLICT', field: 'id' })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('collectSubtree', () => {
    beforeEach(() => {
      prismaMock.$transaction.mockImplementation(
        async (callback: any) => await callback(prismaMock)
      )
      prismaMock.campaign.update.mockResolvedValue(fixture)
    })

    it('lists a block, then its children and owned blocks, parents first', () => {
      const media = {
        ...hero,
        id: 'heroMediaId',
        parentBlockId: null,
        parentOrder: null
      }
      const live = [
        ...fixture.blocks.map((block) =>
          block.id === 'heroId'
            ? { ...block, mediaBlockId: 'heroMediaId' }
            : block
        ),
        media
      ]

      expect(collectSubtree('heroId', live).map((block) => block.id)).toEqual([
        'heroId',
        'heroMediaId',
        'heroButtonId'
      ])
    })
  })
})

describe('section style (the nine shared section fields)', () => {
  describe('sectionStyleColumns', () => {
    it('writes the kind exactly as given and never derives it from the populated columns', () => {
      // A section with a custom colour and a cover switched to a surface band
      // keeps both: only backgroundKind is in the data.
      expect(sectionStyleColumns({ backgroundKind: 'surface' })).toEqual({
        backgroundKind: 'surface'
      })
      expect(
        sectionStyleColumns({
          backgroundKind: 'custom',
          backgroundColor: '#fff'
        })
      ).toEqual({ backgroundKind: 'custom', backgroundColor: '#FFFFFF' })
      expect(sectionStyleColumns({})).toEqual({})
    })

    it.each(['none', 'surface', 'contrast', 'primary', 'custom', 'image'])(
      'accepts backgroundKind %s',
      (kind) => {
        expect(sectionStyleColumns({ backgroundKind: kind })).toEqual({
          backgroundKind: kind
        })
      }
    )

    it.each(['gradient', '', null])(
      'rejects backgroundKind %j (BAD_USER_INPUT, backgroundKind)',
      (kind) => {
        expect(() => sectionStyleColumns({ backgroundKind: kind })).toThrow(
          expect.objectContaining({
            extensions: { code: 'BAD_USER_INPUT', field: 'backgroundKind' }
          })
        )
      }
    )

    it('takes backgroundOverlay light, medium, heavy or null', () => {
      for (const overlay of ['light', 'medium', 'heavy', null]) {
        expect(sectionStyleColumns({ backgroundOverlay: overlay })).toEqual({
          backgroundOverlay: overlay
        })
      }
      expect(() => sectionStyleColumns({ backgroundOverlay: 'dark' })).toThrow(
        expect.objectContaining({
          extensions: { code: 'BAD_USER_INPUT', field: 'backgroundOverlay' }
        })
      )
    })

    it.each([
      'backgroundColor',
      'headingColor',
      'textColor',
      'buttonColor',
      'buttonTextColor',
      'accentColor'
    ])(
      'normalises %s through assertHex and accepts null, never ""',
      (column) => {
        expect(sectionStyleColumns({ [column]: ' #abc ' })).toEqual({
          [column]: '#AABBCC'
        })
        expect(sectionStyleColumns({ [column]: '#a1B2c3' })).toEqual({
          [column]: '#A1B2C3'
        })
        expect(sectionStyleColumns({ [column]: null })).toEqual({
          [column]: null
        })
        for (const bad of ['', 'red', 'rgb(1,2,3)', '#AABBCCDD']) {
          expect(() => sectionStyleColumns({ [column]: bad })).toThrow(
            expect.objectContaining({
              extensions: { code: 'BAD_USER_INPUT', field: column }
            })
          )
        }
      }
    )
  })
})

describe('owned blocks (cover, logo and media)', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const header = fixture.blocks.find((block) => block.id === 'headerId')!
  const featuredMedia = {
    ...hero,
    id: 'featuredId',
    typename: 'CampaignFeaturedMediaBlock',
    parentOrder: 5,
    title: null,
    eyebrow: null,
    description: null
  }

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.update.mockResolvedValue(fixture)
  })

  describe('assertImageSlot', () => {
    it('defaults to cover, which every section and chrome block has', () => {
      expect(assertImageSlot(hero, undefined)).toBe('cover')
      expect(assertImageSlot(header, 'cover')).toBe('cover')
      expect(assertImageSlot(header, 'logo')).toBe('logo')
    })

    it('refuses the logo slot off the header with the slot column as field (BAD_USER_INPUT, logoBlockId)', () => {
      expect(() => assertImageSlot(hero, 'logo')).toThrow(
        expect.objectContaining({
          extensions: { code: 'BAD_USER_INPUT', field: 'logoBlockId' }
        })
      )
    })

    it('allows the media slot on a hero or Featured Media section only, with the slot column as field (BAD_USER_INPUT, mediaBlockId)', () => {
      expect(assertImageSlot(hero, 'media')).toBe('media')
      expect(
        assertImageSlot({ typename: 'CampaignFeaturedMediaBlock' }, 'media')
      ).toBe('media')

      for (const owner of [
        header,
        fixture.blocks.find((block) => block.id === 'carouselId')!,
        { typename: 'CampaignImageBlock' }
      ])
        expect(() => assertImageSlot(owner, 'media')).toThrow(
          expect.objectContaining({
            extensions: { code: 'BAD_USER_INPUT', field: 'mediaBlockId' }
          })
        )
    })

    it('rejects an unknown slot (BAD_USER_INPUT, slot)', () => {
      expect(() => assertImageSlot(hero, 'banner')).toThrow(
        expect.objectContaining({
          extensions: { code: 'BAD_USER_INPUT', field: 'slot' }
        })
      )
    })
  })

  describe('assertMediaOwner', () => {
    it('accepts a hero and a Featured Media section', () => {
      expect(() => assertMediaOwner(hero)).not.toThrow()
      expect(() => assertMediaOwner(featuredMedia)).not.toThrow()
    })

    it.each([
      'CampaignVideoCarouselBlock',
      'CampaignImageBlock',
      'CampaignHeaderBlock',
      'CampaignButtonBlock'
    ])(
      'refuses a %s with the slot column as field (BAD_USER_INPUT, mediaBlockId)',
      (typename) => {
        expect(() => assertMediaOwner({ typename })).toThrow(
          expect.objectContaining({
            extensions: { code: 'BAD_USER_INPUT', field: 'mediaBlockId' }
          })
        )
      }
    )
  })

  describe('createOwnedImageBlock', () => {
    it('creates the image with parentOrder null and the owner’s scoping, points the slot column at it and soft-deletes the previous one', async () => {
      mockCampaignBlockWrites(hero)
      prismaMock.campaignBlock.update.mockResolvedValue(hero)
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        ...hero,
        coverBlockId: 'oldCoverId'
      })

      const image = await createOwnedImageBlock(
        prismaMock,
        { ...hero, coverBlockId: 'oldCoverId' },
        'cover',
        { id: 'coverId', src: 'https://imagedelivery.net/a/b/public' }
      )

      expect(image).toMatchObject({
        id: 'coverId',
        typename: 'CampaignImageBlock',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: 'heroId',
        parentOrder: null
      })
      expect(prismaMock.campaignBlock.updateMany).toHaveBeenCalledWith({
        where: { id: 'oldCoverId', parentBlockId: 'heroId' },
        data: { deletedAt: expect.any(Date) }
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroId' },
        data: { coverBlockId: 'coverId' }
      })
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })

    it('writes logoBlockId on the header and deletes nothing when the slot was empty', async () => {
      mockCampaignBlockWrites(header)
      prismaMock.campaignBlock.update.mockResolvedValue(header)
      prismaMock.campaignBlock.findFirst.mockResolvedValue(header)

      const image = await createOwnedImageBlock(prismaMock, header, 'logo', {
        id: 'logoId'
      })

      expect(image).toMatchObject({
        id: 'logoId',
        pageId: null,
        regionId: null,
        parentBlockId: 'headerId',
        parentOrder: null
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'headerId' },
        data: { logoBlockId: 'logoId' }
      })
    })

    it('fills an empty Media Slot with an image through createOwnedImageBlock without deleting anything', async () => {
      mockCampaignBlockWrites(hero)
      prismaMock.campaignBlock.update.mockResolvedValue(hero)
      prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)

      const image = await createOwnedImageBlock(prismaMock, hero, 'media', {
        id: 'imageId'
      })

      expect(image).toMatchObject({
        id: 'imageId',
        typename: 'CampaignImageBlock',
        parentBlockId: 'heroId',
        parentOrder: null
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroId' },
        data: { mediaBlockId: 'imageId' }
      })
    })
  })

  describe('createOwnedBlock', () => {
    it('creates a unique owned video with parentOrder null, points mediaBlockId at it and soft-deletes the block the slot held', async () => {
      mockCampaignBlockWrites(hero)
      prismaMock.campaignBlock.update.mockResolvedValue(hero)
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        ...featuredMedia,
        mediaBlockId: 'oldImageId'
      })

      const video = await createOwnedBlock(
        prismaMock,
        { ...featuredMedia, mediaBlockId: 'oldImageId' },
        'mediaBlockId',
        {
          id: 'videoId',
          typename: 'CampaignVideoBlock',
          source: 'internal',
          videoId: '1_jf-0-0',
          videoVariantLanguageId: '529'
        }
      )

      expect(video).toMatchObject({
        id: 'videoId',
        typename: 'CampaignVideoBlock',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: 'featuredId',
        parentOrder: null
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
        data: {
          id: 'videoId',
          typename: 'CampaignVideoBlock',
          source: 'internal',
          videoId: '1_jf-0-0',
          videoVariantLanguageId: '529',
          campaignId: 'campaignId',
          pageId: 'landingPageId',
          regionId: null,
          parentBlockId: 'featuredId',
          parentOrder: null
        },
        include: { action: true }
      })
      expect(prismaMock.campaignBlock.updateMany).toHaveBeenCalledWith({
        where: { id: 'oldImageId', parentBlockId: 'featuredId' },
        data: { deletedAt: expect.any(Date) }
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'featuredId' },
        data: { mediaBlockId: 'videoId' }
      })
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })
  })
})

describe('the slot contract (cover, logo and media)', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const owner = {
    ...hero,
    id: 'ownerId',
    coverBlockId: 'heldCoverId',
    logoBlockId: 'heldLogoId',
    mediaBlockId: 'heldMediaId'
  }
  const columns = ['coverBlockId', 'logoBlockId', 'mediaBlockId'] as const
  const held = {
    coverBlockId: 'heldCoverId',
    logoBlockId: 'heldLogoId',
    mediaBlockId: 'heldMediaId'
  }
  const typenameFor = (column: (typeof columns)[number]): string =>
    column === 'mediaBlockId' ? 'CampaignVideoBlock' : 'CampaignImageBlock'

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.update.mockResolvedValue(fixture)
    mockCampaignBlockWrites(owner)
  })

  describe('validateSlotTarget', () => {
    it.each(columns)('empties %s on null without a lookup', async (column) => {
      await expect(
        validateSlotTarget(prismaMock, column, null, owner)
      ).resolves.toBeNull()
      expect(prismaMock.campaignBlock.findFirst).not.toHaveBeenCalled()
    })

    it.each(columns)(
      'accepts a block the owner owns for %s, live or soft-deleted',
      async (column) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue({
          id: 'newId',
          typename: typenameFor(column)
        } as never)

        await expect(
          validateSlotTarget(prismaMock, column, 'newId', owner)
        ).resolves.toBe('newId')
        expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
          where: {
            id: 'newId',
            campaignId: 'campaignId',
            parentBlockId: 'ownerId'
          },
          select: { id: true, typename: true }
        })
      }
    )

    it('takes an image or a video for media', async () => {
      for (const typename of ['CampaignImageBlock', 'CampaignVideoBlock']) {
        prismaMock.campaignBlock.findFirst.mockResolvedValueOnce({
          id: 'newId',
          typename
        } as never)
        await expect(
          validateSlotTarget(prismaMock, 'mediaBlockId', 'newId', owner)
        ).resolves.toBe('newId')
      }
    })

    it.each(['coverBlockId', 'logoBlockId'] as const)(
      'refuses a video for %s (BAD_USER_INPUT, the slot column)',
      async (column) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue({
          id: 'newId',
          typename: 'CampaignVideoBlock'
        } as never)

        const error = await errorOf(
          validateSlotTarget(prismaMock, column, 'newId', owner)
        )

        expect(error.extensions).toEqual({
          code: 'BAD_USER_INPUT',
          field: column
        })
      }
    )

    it.each(columns)(
      'refuses a block another section owns or a missing one for %s (BAD_USER_INPUT, the slot column)',
      async (column) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

        const error = await errorOf(
          validateSlotTarget(prismaMock, column, 'elsewhereId', owner)
        )

        expect(error.extensions).toEqual({
          code: 'BAD_USER_INPUT',
          field: column
        })
      }
    )

    it.each(
      columns.flatMap((column) =>
        columns
          .filter((other) => other !== column)
          .map((other) => [column, other] as const)
      )
    )(
      'refuses for %s the block %s holds (BAD_USER_INPUT, the slot column)',
      async (column, other) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue({
          id: held[other],
          typename: 'CampaignImageBlock'
        } as never)

        const error = await errorOf(
          validateSlotTarget(prismaMock, column, held[other], owner)
        )

        expect(error.extensions).toEqual({
          code: 'BAD_USER_INPUT',
          field: column
        })
      }
    )

    it('leaves the block the column already holds alone', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        id: 'heldCoverId',
        typename: 'CampaignImageBlock'
      } as never)

      await expect(
        validateSlotTarget(prismaMock, 'coverBlockId', 'heldCoverId', owner)
      ).resolves.toBe('heldCoverId')
    })
  })

  describe('swapSlot', () => {
    const deletedAt = new Date('2026-10-22T00:00:00.000Z')

    it('soft-deletes the block the slot held and restores the new one', async () => {
      await swapSlot(prismaMock, owner, 'coverBlockId', 'newId', deletedAt)

      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([
        {
          where: { id: 'heldCoverId' },
          data: { deletedAt }
        },
        { where: { id: 'newId' }, data: { deletedAt: null } }
      ])
    })

    it('fills an empty slot by restoring the target only', async () => {
      await swapSlot(
        prismaMock,
        { ...owner, logoBlockId: null },
        'logoBlockId',
        'newId',
        deletedAt
      )

      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([{ where: { id: 'newId' }, data: { deletedAt: null } }])
    })

    it('empties the slot by soft-deleting the block it held', async () => {
      await swapSlot(prismaMock, owner, 'logoBlockId', null, deletedAt)

      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([{ where: { id: 'heldLogoId' }, data: { deletedAt } }])
    })

    it('never deletes the block when it is already in the slot', async () => {
      await swapSlot(
        prismaMock,
        owner,
        'mediaBlockId',
        'heldMediaId',
        deletedAt
      )

      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([{ where: { id: 'heldMediaId' }, data: { deletedAt: null } }])
    })
  })

  describe('updateBlock', () => {
    const ownerRef = { id: 'ownerId', campaignId: 'campaignId' }

    beforeEach(() => {
      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(owner)
    })

    it.each(columns)(
      'repoints %s inside the update: the outgoing block soft-deleted, the incoming (even a soft-deleted one) restored, then the column written',
      async (column) => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue({
          id: 'newId',
          typename: typenameFor(column)
        } as never)

        await updateBlock(ownerRef, { [column]: 'newId' })

        expect(
          prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
        ).toEqual([
          {
            where: { id: held[column] },
            data: { deletedAt: expect.any(Date) }
          },
          { where: { id: 'newId' }, data: { deletedAt: null } },
          {
            where: { id: 'ownerId' },
            data: { [column]: 'newId' },
            include: { action: true }
          }
        ])
      }
    )

    it.each(columns)(
      'null empties %s and soft-deletes the block it held',
      async (column) => {
        await updateBlock(ownerRef, { [column]: null })

        expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledTimes(1)
        expect(
          prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
        ).toEqual([
          {
            where: { id: held[column] },
            data: { deletedAt: expect.any(Date) }
          },
          {
            where: { id: 'ownerId' },
            data: { [column]: null },
            include: { action: true }
          }
        ])
      }
    )

    it.each(columns)(
      'refuses %s pointed at the block another slot holds, without writing',
      async (column) => {
        const other = columns.find((candidate) => candidate !== column)!
        prismaMock.campaignBlock.findFirst.mockResolvedValue({
          id: held[other],
          typename: 'CampaignImageBlock'
        } as never)

        const error = await errorOf(
          updateBlock(ownerRef, { [column]: held[other] })
        )

        expect(error.extensions).toEqual({
          code: 'BAD_USER_INPUT',
          field: column
        })
        expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
      }
    )

    it('stamps every block one update swaps out with one timestamp, so restore never splits or joins them', async () => {
      prismaMock.campaignBlock.findFirst.mockImplementation((async ({
        where
      }: any) => ({
        id: where.id,
        typename:
          where.id === 'newMediaId'
            ? 'CampaignVideoBlock'
            : 'CampaignImageBlock'
      })) as never)

      await updateBlock(ownerRef, {
        coverBlockId: 'newCoverId',
        mediaBlockId: 'newMediaId'
      })

      const stamped = prismaMock.campaignBlock.update.mock.calls
        .map(([call]: any) => call)
        .filter((call) => call.data.deletedAt instanceof Date)
      expect(stamped.map((call) => call.where.id)).toEqual([
        'heldCoverId',
        'heldMediaId'
      ])
      expect(stamped[1].data.deletedAt).toBe(stamped[0].data.deletedAt)
    })

    it('leaves the structure alone for columns that are not slots', async () => {
      await updateBlock(ownerRef, { backgroundKind: 'surface' })

      expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
      expect(prismaMock.campaignBlock.findFirst).not.toHaveBeenCalled()
    })
  })
})

describe('the structure lock', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const heroButton = fixture.blocks.find(
    (block) => block.id === 'heroButtonId'
  )!
  const page = fixture.pages[0]

  /** The first invocation of a mocked call, in the order all mocks share. */
  function firstCall(mock: {
    mock: { invocationCallOrder: number[] }
  }): number {
    return Math.min(...mock.mock.invocationCallOrder)
  }

  /** The first `$queryRaw` ran before every read and write of the transaction. */
  function expectLockedBeforeEveryRead(): void {
    const lockedAt = firstCall(prismaMock.$queryRaw)
    for (const mock of [
      prismaMock.campaignBlock.findMany,
      prismaMock.campaignBlock.findFirst,
      prismaMock.campaignBlock.count,
      prismaMock.campaignBlock.create,
      prismaMock.campaignBlock.update,
      prismaMock.campaignBlock.updateMany,
      prismaMock.campaign.update
    ])
      expect(firstCall(mock)).toBeGreaterThan(lockedAt)
  }

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.update.mockResolvedValue(fixture)
    prismaMock.campaignBlock.findMany.mockResolvedValue([])
    mockCampaignBlockWrites(hero)
  })

  /** Each structural transaction: what it must lock before, and a run of it. */
  const transactions: Array<
    [name: string, lockedBefore: string, run: () => Promise<unknown>]
  > = [
    [
      'createChildBlock',
      'it counts the siblings',
      async () =>
        await createChildBlock(prismaMock, hero, {
          typename: 'CampaignButtonBlock'
        })
    ],
    [
      'createTopLevelBlock',
      'the chrome singleton and the sibling reads',
      async () =>
        await createTopLevelBlock(
          prismaMock,
          { campaignId: 'campaignId', pageId: null, regionId: null },
          { typename: 'CampaignFooterBlock' }
        )
    ],
    [
      'createSlotChild',
      'it reads the occupant',
      async () =>
        await createSlotChild(
          prismaMock,
          { ...hero, id: 'slotId', typename: 'CampaignColumnBlock' },
          { typename: 'CampaignHeroBlock' }
        )
    ],
    [
      'createColumnsSection',
      'the section and its slots',
      async () =>
        await createColumnsSection(prismaMock, page, {
          typename: 'CampaignColumnsBlock'
        })
    ],
    [
      'createOwnedBlock',
      'it reads the slot occupant',
      async () => {
        prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)
        return await createOwnedBlock(prismaMock, hero, 'coverBlockId', {
          typename: 'CampaignImageBlock'
        })
      }
    ],
    ...(['coverBlockId', 'logoBlockId', 'mediaBlockId'] as const).map(
      (column): [string, string, () => Promise<unknown>] => [
        `a ${column} update`,
        'it re-reads the owner',
        async () => {
          prismaMock.campaignBlock.findFirst
            .mockResolvedValueOnce(hero)
            .mockResolvedValue({
              id: 'newId',
              typename: 'CampaignImageBlock'
            } as never)
          return await updateBlock(hero, { [column]: 'newId' })
        }
      ]
    ),
    [
      'reorderBlock',
      'it reads the siblings',
      async () => {
        prismaMock.campaignBlock.findMany.mockResolvedValue([
          heroButton
        ] as never)
        return await reorderBlock(heroButton, 0)
      }
    ],
    [
      'removeBlock',
      'it reads the live blocks',
      async () => {
        prismaMock.campaignBlock.findMany.mockResolvedValue([
          heroButton
        ] as never)
        return await removeBlock(heroButton)
      }
    ],
    [
      'restoreBlock',
      'it reads the parent and the siblings',
      async () => await restoreBlock({ ...heroButton, deletedAt: new Date() })
    ],
    [
      'duplicateBlock',
      'it reads the live blocks',
      async () => {
        prismaMock.campaignBlock.findMany.mockResolvedValue([hero] as never)
        return await duplicateBlock(hero)
      }
    ]
  ]

  it.each(transactions)(
    '%s takes the structure lock as its first statement',
    async (_name, _lockedBefore, run) => {
      await run()

      expectStructureLockFirst()
      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
    }
  )

  it.each(transactions)(
    '%s locks before %s',
    async (_name, _lockedBefore, run) => {
      await run()

      expectLockedBeforeEveryRead()
    }
  )

  describe('a block deleted between the resolver’s read and the lock', () => {
    async function expectParentRefused(
      promise: Promise<unknown>
    ): Promise<void> {
      const error = await errorOf(promise)
      expect(error.message).toBe(
        'parentBlockId must be a live section or chrome block of this campaign'
      )
      expect(error.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    }

    async function expectNotFound(promise: Promise<unknown>): Promise<void> {
      const error = await errorOf(promise)
      expect(error.extensions).toEqual({ code: 'NOT_FOUND' })
    }

    it('refuses a child of a section binned since it was validated, without a create', async () => {
      prismaMock.campaignBlock.count.mockResolvedValue(0)

      await expectParentRefused(
        createChildBlock(prismaMock, hero, { typename: 'CampaignButtonBlock' })
      )
      expect(prismaMock.campaignBlock.count).toHaveBeenCalledWith({
        where: { id: 'heroId', deletedAt: null }
      })
    })

    it('refuses a section in a slot binned since with its Columns section, without a create', async () => {
      prismaMock.campaignBlock.count.mockResolvedValue(0)

      await expectParentRefused(
        createSlotChild(
          prismaMock,
          { ...hero, id: 'slotId', typename: 'CampaignColumnBlock' },
          { typename: 'CampaignHeroBlock' }
        )
      )
      expect(prismaMock.campaignBlock.count).toHaveBeenCalledWith({
        where: { id: 'slotId', deletedAt: null }
      })
    })

    it('refuses an owned block under an owner binned since, without a create or a slot write', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      await expectParentRefused(
        createOwnedBlock(prismaMock, hero, 'coverBlockId', {
          typename: 'CampaignImageBlock'
        })
      )
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: { id: 'heroId', deletedAt: null }
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
      expect(prismaMock.campaignBlock.updateMany).not.toHaveBeenCalled()
    })

    it('refuses a slot swap on an owner binned since (NOT_FOUND), reviving nothing', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      await expectNotFound(updateBlock(hero, { mediaBlockId: 'oldMediaId' }))
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: { id: 'heroId', deletedAt: null }
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('keeps one timestamp when two deletes of a section race: the second is NOT_FOUND and restamps nothing', async () => {
      // The first delete has committed: the section is gone from the live read.
      prismaMock.campaignBlock.findMany.mockResolvedValue([] as never)

      await expectNotFound(removeBlock(hero))
      expect(prismaMock.campaignBlock.updateMany).not.toHaveBeenCalled()
      expect(prismaMock.campaign.update).not.toHaveBeenCalled()
    })

    it('refuses a reorder of a block binned since (NOT_FOUND), without a write', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([] as never)

      await expectNotFound(reorderBlock(heroButton, 0, 'above'))
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('refuses a duplicate of a block binned since (NOT_FOUND), without a create', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([heroButton] as never)

      await expectNotFound(duplicateBlock(hero))
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })
  })
})

describe('the block cap', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const heroButton = fixture.blocks.find(
    (block) => block.id === 'heroButtonId'
  )!
  const page = fixture.pages[0]
  const region = campaignFactory().withRegion('EUR').build().regions[0]

  /**
   * `live` blocks in the campaign; `restoring` rows share the restored
   * block's `deletedAt`. A count by id is a parent's liveness: always live.
   */
  function countBlocks(live: number, restoring = 0): void {
    prismaMock.campaignBlock.count.mockImplementation((async ({
      where
    }: any) => {
      if (where.id != null) return where.deletedAt === null ? 1 : 0
      if (where.deletedAt === null) return live
      return where.deletedAt instanceof Date ? restoring : 0
    }) as never)
  }

  async function expectRefused(promise: Promise<unknown>): Promise<void> {
    const error = await errorOf(promise)
    expect(error.message).toBe(
      `a campaign has at most ${CAMPAIGN_BLOCKS_MAX} blocks`
    )
    expect(error.extensions).toEqual({
      code: 'BAD_USER_INPUT',
      field: 'campaignId'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  }

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.update.mockResolvedValue(fixture)
    prismaMock.campaignBlock.findMany.mockResolvedValue([])
    mockCampaignBlockWrites(hero, { createdId: 'newId' })
  })

  it('counts the live blocks inside the transaction, after the structure lock', async () => {
    countBlocks(0)

    await createChildBlock(prismaMock, hero, {
      typename: 'CampaignTypographyBlock'
    })

    expect(prismaMock.campaignBlock.count).toHaveBeenCalledWith({
      where: { campaignId: 'campaignId', deletedAt: null }
    })
    expectStructureLockFirst()
    expect(prismaMock.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.campaignBlock.count.mock.invocationCallOrder[0]
    )
  })

  describe('a child block', () => {
    it(`is refused at ${CAMPAIGN_BLOCKS_MAX} live blocks`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX)
      await expectRefused(
        createChildBlock(prismaMock, hero, {
          typename: 'CampaignTypographyBlock'
        })
      )
    })

    it('is allowed one below', async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 1)
      await createChildBlock(prismaMock, hero, {
        typename: 'CampaignTypographyBlock'
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('a section', () => {
    it(`is refused at ${CAMPAIGN_BLOCKS_MAX} live blocks`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX)
      await expectRefused(
        createTopLevelBlock(
          prismaMock,
          { campaignId: 'campaignId', pageId: page.id, regionId: null },
          { typename: 'CampaignHeroBlock' }
        )
      )
    })

    it('is allowed one below', async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 1)
      await createTopLevelBlock(
        prismaMock,
        { campaignId: 'campaignId', pageId: page.id, regionId: null },
        { typename: 'CampaignHeroBlock' }
      )
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('a Region Line', () => {
    it(`is refused at ${CAMPAIGN_BLOCKS_MAX} live blocks`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX)
      await expectRefused(
        createRegionLine(prismaMock, region, {
          typename: 'CampaignTypographyBlock',
          content: 'Line'
        })
      )
    })

    it('is allowed one below', async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 1)
      await createRegionLine(prismaMock, region, {
        typename: 'CampaignTypographyBlock',
        content: 'Line'
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('a Columns section', () => {
    it('is refused when its two slots would cross the cap', async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 1)
      const error = await errorOf(
        createColumnsSection(prismaMock, page, {
          typename: 'CampaignColumnsBlock'
        })
      )
      expect(error.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'campaignId'
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(1)
    })

    it('is allowed when the section and its slots fit', async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 2)
      await createColumnsSection(prismaMock, page, {
        typename: 'CampaignColumnsBlock'
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(3)
    })
  })

  describe('an owned block', () => {
    function holding(coverBlockId: string | null): void {
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        ...hero,
        coverBlockId
      })
    }

    beforeEach(() => {
      prismaMock.campaignBlock.update.mockResolvedValue(hero)
    })

    it(`is refused at ${CAMPAIGN_BLOCKS_MAX} live blocks when the slot is empty`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX)
      holding(null)
      await expectRefused(
        createOwnedBlock(prismaMock, hero, 'coverBlockId', {
          typename: 'CampaignImageBlock'
        })
      )
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it(`is allowed at ${CAMPAIGN_BLOCKS_MAX} live blocks when it replaces the block the slot held`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX)
      holding('oldCoverId')
      await createOwnedBlock(prismaMock, hero, 'coverBlockId', {
        typename: 'CampaignImageBlock'
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('a duplicate', () => {
    beforeEach(() => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([
        { ...hero, action: null },
        { ...heroButton, action: null }
      ] as never)
    })

    it(`is refused when its subtree would cross ${CAMPAIGN_BLOCKS_MAX}`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 1)
      await expectRefused(duplicateBlock(hero))
    })

    it(`is allowed when its subtree reaches ${CAMPAIGN_BLOCKS_MAX}`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 2)
      await duplicateBlock(hero)
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(2)
    })
  })

  describe('a restore', () => {
    const deleted = {
      ...hero,
      parentOrder: 0,
      deletedAt: new Date('2026-10-01T00:00:00.000Z')
    }

    beforeEach(() => {
      prismaMock.campaignBlock.update.mockResolvedValue(deleted)
    })

    it(`is refused when the rows deleted with the block would cross ${CAMPAIGN_BLOCKS_MAX}`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 2, 3)
      const error = await errorOf(restoreBlock(deleted))
      expect(error.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'campaignId'
      })
      expect(prismaMock.campaignBlock.count).toHaveBeenCalledWith({
        where: { campaignId: 'campaignId', deletedAt: deleted.deletedAt }
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
      expect(prismaMock.campaignBlock.updateMany).not.toHaveBeenCalled()
    })

    it(`is allowed when they reach ${CAMPAIGN_BLOCKS_MAX}`, async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX - 3, 3)
      await restoreBlock(deleted)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalled()
    })

    it('counts nothing for a live block, which only renumbers', async () => {
      countBlocks(CAMPAIGN_BLOCKS_MAX)
      await restoreBlock({ ...deleted, deletedAt: null })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalled()
    })
  })
})
