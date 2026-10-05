import { GraphQLError } from 'graphql'

import { User } from '@core/yoga/firebaseClient'

import { campaignBlockWithAcl } from '../../../../test/campaignBlockFactory'
import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { INCLUDE_CAMPAIGN_ACL } from '../campaign.acl'

import {
  assertImageSlot,
  assertPlacement,
  assertTopLevelScope,
  authorizeBlockCreate,
  authorizeBlockUpdate,
  authorizeStructuralBlock,
  authorizeTypedBlockUpdate,
  collectSubtree,
  createChildBlock,
  createOwnedImageBlock,
  createTopLevelBlock,
  getSiblings,
  removeBlock,
  restoreBlock,
  sectionStyleColumns,
  validateImageOwner,
  validateImageSlotTarget,
  validateParentBlock,
  validateSectionPage,
  validateSectionStyle
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

    it('refuses a column slot (CONFLICT, id)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, 'heroId', {
          id: 'slotId',
          typename: 'CampaignColumnBlock'
        })
      )

      const error = await errorOf(
        authorizeStructuralBlock('slotId', user, 'moved')
      )

      expect(error.extensions).toMatchObject({ code: 'CONFLICT', field: 'id' })
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
      prismaMock.campaignBlock.create.mockImplementation((async ({
        data
      }: any) => ({ ...hero, ...data, action: null })) as never)

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
      prismaMock.campaignBlock.create.mockImplementation((async ({
        data
      }: any) => ({ ...hero, ...data, id: 'newId', action: null })) as never)
      prismaMock.campaignBlock.update.mockImplementation((async ({
        where,
        data
      }: any) => ({ ...hero, id: where.id, ...data })) as never)

      const created = await createTopLevelBlock(
        prismaMock,
        { campaignId: 'campaignId', pageId: 'landingPageId', regionId: null },
        { typename: 'CampaignAnalyticsBlock' },
        2
      )

      expect(created).toMatchObject({ id: 'newId', parentOrder: 2 })
      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => [
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

  describe('collectSubtree', () => {
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

describe('owned images (cover and logo)', () => {
  const fixture = campaignFactory().build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const header = fixture.blocks.find((block) => block.id === 'headerId')!

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.update.mockResolvedValue(fixture)
  })

  describe('validateImageOwner', () => {
    it('returns a live section or chrome block of the campaign', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(header)

      await expect(validateImageOwner('headerId', 'campaignId')).resolves.toBe(
        header
      )
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: { id: 'headerId', campaignId: 'campaignId', deletedAt: null }
      })
    })

    it('rejects an Extra or a missing block (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(
        fixture.blocks.find((block) => block.id === 'heroButtonId')!
      )
      const extra = await errorOf(
        validateImageOwner('heroButtonId', 'campaignId')
      )
      expect(extra.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })

      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(null)
      const missing = await errorOf(validateImageOwner('nope', 'campaignId'))
      expect(missing.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
    })
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

    it('rejects an unknown slot (BAD_USER_INPUT, slot)', () => {
      expect(() => assertImageSlot(hero, 'media')).toThrow(
        expect.objectContaining({
          extensions: { code: 'BAD_USER_INPUT', field: 'slot' }
        })
      )
    })
  })

  describe('createOwnedImageBlock', () => {
    it('creates the image with parentOrder null and the owner’s scoping, points the slot column at it and soft-deletes the previous one', async () => {
      prismaMock.campaignBlock.create.mockImplementation((async ({
        data
      }: any) => ({ ...hero, ...data, action: null })) as never)
      prismaMock.campaignBlock.update.mockResolvedValue(hero)

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
      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([
        { where: { id: 'oldCoverId' }, data: { deletedAt: expect.any(Date) } },
        { where: { id: 'heroId' }, data: { coverBlockId: 'coverId' } }
      ])
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })

    it('writes logoBlockId on the header and deletes nothing when the slot was empty', async () => {
      prismaMock.campaignBlock.create.mockImplementation((async ({
        data
      }: any) => ({ ...header, ...data, action: null })) as never)
      prismaMock.campaignBlock.update.mockResolvedValue(header)

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
  })
})

describe('section style (the nine shared section fields)', () => {
  const block = { campaignId: 'campaignId' }

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

  describe('validateImageSlotTarget', () => {
    it('returns null for a cleared slot without a lookup', async () => {
      await expect(
        validateImageSlotTarget(null, 'campaignId', 'logoBlockId')
      ).resolves.toBeNull()
      expect(prismaMock.campaignBlock.findFirst).not.toHaveBeenCalled()
    })

    it('resolves a live image block of the campaign for any slot column', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        id: 'logoId'
      } as never)

      await expect(
        validateImageSlotTarget('logoId', 'campaignId', 'logoBlockId')
      ).resolves.toBe('logoId')
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'logoId',
          campaignId: 'campaignId',
          typename: 'CampaignImageBlock',
          deletedAt: null
        },
        select: { id: true }
      })
    })

    it('names the slot column as the field when the target is not an image (BAD_USER_INPUT)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const error = await errorOf(
        validateImageSlotTarget('heroId', 'campaignId', 'logoBlockId')
      )

      expect(error.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'logoBlockId'
      })
    })
  })

  describe('validateSectionStyle', () => {
    it('clears the cover without a lookup', async () => {
      await expect(
        validateSectionStyle({ coverBlockId: null }, block)
      ).resolves.toEqual({ coverBlockId: null })
      expect(prismaMock.campaignBlock.findFirst).not.toHaveBeenCalled()
    })

    it('resolves a given cover to a live image block of the same campaign', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        id: 'coverId'
      } as never)

      await expect(
        validateSectionStyle(
          { backgroundKind: 'image', coverBlockId: 'coverId' },
          block
        )
      ).resolves.toEqual({ backgroundKind: 'image', coverBlockId: 'coverId' })
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'coverId',
          campaignId: 'campaignId',
          typename: 'CampaignImageBlock',
          deletedAt: null
        },
        select: { id: true }
      })
    })

    it('rejects a cover that is not a live image block of the campaign (BAD_USER_INPUT, coverBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

      const error = await errorOf(
        validateSectionStyle({ coverBlockId: 'heroId' }, block)
      )

      expect(error.extensions).toEqual({
        code: 'BAD_USER_INPUT',
        field: 'coverBlockId'
      })
    })
  })
})
