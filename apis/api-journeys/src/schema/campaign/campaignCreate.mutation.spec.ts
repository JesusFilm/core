import { v4 as uuidv4 } from 'uuid'
import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import {
  CAMPAIGN_FIXTURE_DATE,
  CampaignFixture,
  LIGHT_PALETTE,
  campaignFactory
} from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { fetchLanguage } from './gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./gatewayClient', () => ({ fetchLanguage: vi.fn() }))

vi.mock('uuid', () => ({ v4: vi.fn() }))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const mockFetchLanguage = fetchLanguage as MockedFunction<typeof fetchLanguage>

const ID_FIELDS = new Set([
  'id',
  'campaignId',
  'pageId',
  'parentBlockId',
  'blockId',
  'campaignBlockId',
  'coverBlockId',
  'mediaBlockId',
  'logoBlockId'
])
const TIMESTAMP_FIELDS = new Set(['createdAt', 'updatedAt', 'deletedAt'])
// Column defaults the seed leaves to Prisma but a stored row always carries.
const COLUMN_DEFAULTS: Record<string, unknown> = { backgroundKind: 'none' }

/**
 * Strip nulls, timestamps and column defaults, and replace every id with a
 * positional label so the factory's readable ids and the mutation's generated
 * ids compare equal.
 */
function normalize(
  row: Record<string, unknown>,
  labels: Map<string, string>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row)
      .filter(
        ([key, value]) =>
          value != null &&
          !TIMESTAMP_FIELDS.has(key) &&
          COLUMN_DEFAULTS[key] !== value
      )
      .map(([key, value]) => [
        key,
        ID_FIELDS.has(key) ? (labels.get(value as string) ?? value) : value
      ])
  )
}

/** The `data` argument of a mock's first call. */
function firstCallData<T = Record<string, unknown>>(mock: {
  mock: { calls: unknown[][] }
}): T {
  const call = mock.mock.calls[0]
  if (call == null) throw new Error('expected the mock to have been called')
  return (call[0] as { data: T }).data
}

describe('campaignCreate', () => {
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

  const CAMPAIGN_CREATE = graphql(`
    mutation CampaignCreate($input: CampaignCreateInput!) {
      campaignCreate(input: $input) {
        id
        title
        slug
        status
        defaultLanguageId
        palette
        publishedAt
        languages {
          languageId
          order
        }
        theme {
          themeMode
          headerFont
          bodyFont
          labelFont
          primaryColor
          accentColor
          backgroundColor
          surfaceColor
          textColor
          mutedColor
          contrastBackgroundColor
          contrastTextColor
          radius
          buttonRadius
        }
        pages {
          kind
        }
        blocks {
          __typename
          id
          pageId
          regionId
          parentBlockId
          parentOrder
          ... on CampaignSectionBlock {
            backgroundKind
          }
          ... on CampaignHeroBlock {
            eyebrow
            title
            lede
            align
            mediaBlockId
          }
          ... on CampaignRegionSwitcherBlock {
            title
            switcherVariant: variant
          }
          ... on CampaignVideoCarouselBlock {
            eyebrow
            title
            videoId
          }
          ... on CampaignJourneyListBlock {
            eyebrow
            title
            lede
            display
          }
          ... on CampaignAnalyticsBlock {
            eyebrow
            title
            showMap
          }
          ... on CampaignRegionHeaderBlock {
            intro
          }
          ... on CampaignRegionShareBlock {
            title
            intro
          }
          ... on CampaignHeaderBlock {
            logoBlockId
          }
          ... on CampaignTypographyBlock {
            content
            typographyVariant: variant
            placement
          }
          ... on CampaignButtonBlock {
            label
            buttonVariant: variant
            size
            placement
            action {
              __typename
              ... on CampaignScrollToBlockAction {
                blockId
              }
              ... on CampaignLinkAction {
                url
              }
            }
          }
        }
        regions {
          id
        }
        strings {
          key
          value
        }
      }
    }
  `)

  const input = {
    teamId: 'teamId',
    title: 'Christmas 2026',
    defaultLanguageId: '529'
  }

  let fixture: CampaignFixture

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'], now: CAMPAIGN_FIXTURE_DATE })
    let nextId = 0
    vi.mocked(uuidv4).mockImplementation(() => `id-${++nextId}`)
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    fixture = campaignFactory().build()
    prismaMock.team.findUnique.mockResolvedValue(fixture.team)
    mockFetchLanguage.mockResolvedValue({ id: '529', bcp47: 'en' })
    prismaMock.campaign.findMany.mockResolvedValue([])
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(fixture)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function create(overrides: Partial<typeof input> = {}) {
    return (await authClient({
      document: CAMPAIGN_CREATE,
      variables: { input: { ...input, ...overrides } }
    })) as any
  }

  function createdBlocks(): Array<Record<string, unknown>> {
    return prismaMock.campaignBlock.create.mock.calls.map(
      ([args]) => args.data as Record<string, unknown>
    )
  }

  function createdBlock(
    typename: string,
    pick: (block: Record<string, unknown>) => boolean = () => true
  ): Record<string, unknown> {
    const block = createdBlocks().find(
      (candidate) => candidate.typename === typename && pick(candidate)
    )
    if (block == null) throw new Error(`${typename} was not seeded`)
    return block
  }

  function actionOf(block: Record<string, unknown>): Record<string, unknown> {
    const action = prismaMock.campaignAction.create.mock.calls
      .map(([args]) => args.data as Record<string, unknown>)
      .find((candidate) => candidate.campaignBlockId === block.id)
    if (action == null) throw new Error(`${String(block.id)} has no action`)
    return action
  }

  function landingPageId(): string {
    const page = prismaMock.campaignPage.create.mock.calls
      .map(([args]) => args.data as { id: string; kind: string })
      .find((candidate) => candidate.kind === 'landing')
    if (page == null) throw new Error('landing page was not seeded')
    return page.id
  }

  function regionPageId(): string {
    const page = prismaMock.campaignPage.create.mock.calls
      .map(([args]) => args.data as { id: string; kind: string })
      .find((candidate) => candidate.kind === 'regionTemplate')
    if (page == null) throw new Error('region page was not seeded')
    return page.id
  }

  describe('seed, inside one transaction', () => {
    it('seeds the Campaign with title, generated slug, draft status, defaultLanguageId, the Light palette primary first and no publishedAt', async () => {
      const result = await create()
      expect(result.errors).toBeUndefined()
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaign.create).toHaveBeenCalledWith({
        data: {
          id: 'id-1',
          teamId: 'teamId',
          title: 'Christmas 2026',
          slug: 'christmas-2026',
          status: 'draft',
          defaultLanguageId: '529',
          palette: LIGHT_PALETTE,
          publishedAt: null
        }
      })
      expect(LIGHT_PALETTE[0]).toBe('#C52D3A')
    })

    it('seeds one CampaignLanguage row for the default language at order 0', async () => {
      await create()
      expect(prismaMock.campaignLanguage.create).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignLanguage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          campaignId: 'id-1',
          languageId: '529',
          order: 0
        })
      })
    })

    it('seeds the CampaignTheme on the Light preset with null fonts, radius rounded and buttonRadius pill', async () => {
      await create()
      expect(prismaMock.campaignTheme.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          campaignId: 'id-1',
          themeMode: 'light',
          headerFont: null,
          bodyFont: null,
          labelFont: null,
          primaryColor: '#C52D3A',
          accentColor: '#F2B544',
          backgroundColor: '#FBF7F1',
          surfaceColor: '#FFFFFF',
          textColor: '#26262E',
          mutedColor: '#6D6F81',
          contrastBackgroundColor: '#26262E',
          contrastTextColor: '#FFFFFF',
          radius: 'rounded',
          buttonRadius: 'pill'
        })
      })
    })

    it('seeds two CampaignPage rows, landing and regionTemplate', async () => {
      await create()
      const kinds = prismaMock.campaignPage.create.mock.calls.map(
        ([args]) => (args.data as { kind: string }).kind
      )
      expect(kinds).toEqual(['landing', 'regionTemplate'])
      expect(prismaMock.campaignPage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ campaignId: 'id-1' })
      })
    })

    it('seeds no regions', async () => {
      await create()
      expect(prismaMock.campaignRegion.create).not.toHaveBeenCalled()
      expect(prismaMock.campaignRegion.createMany).not.toHaveBeenCalled()
    })
  })

  describe('landing page seed', () => {
    it('seeds the Hero with eyebrow, title, lede, align center, no media and one button extra below scrolling to section 2', async () => {
      await create()
      const hero = createdBlock('CampaignHeroBlock')
      expect(hero).toEqual({
        id: expect.any(String),
        typename: 'CampaignHeroBlock',
        campaignId: 'id-1',
        pageId: landingPageId(),
        regionId: null,
        parentBlockId: null,
        parentOrder: 0,
        eyebrow: 'Christmas 2026',
        title: 'Share the story of Christmas',
        lede: 'Pick your region to find a journey in your language, ready to share.',
        align: 'center',
        backgroundKind: 'none'
      })
      const button = createdBlock(
        'CampaignButtonBlock',
        (block) => block.parentBlockId === hero.id
      )
      expect(button).toMatchObject({
        pageId: landingPageId(),
        parentOrder: 0,
        label: 'Choose your region',
        placement: 'below'
      })
      const switcher = createdBlock(
        'CampaignRegionSwitcherBlock',
        (block) => block.pageId === landingPageId()
      )
      expect(actionOf(button)).toEqual({
        campaignBlockId: button.id,
        blockId: switcher.id
      })
    })

    it('seeds the Region switcher with title "Choose your region" and variant cards', async () => {
      await create()
      expect(
        createdBlock(
          'CampaignRegionSwitcherBlock',
          (block) => block.pageId === landingPageId()
        )
      ).toMatchObject({
        parentBlockId: null,
        parentOrder: 1,
        title: 'Choose your region',
        switcherVariant: 'cards'
      })
    })

    it('seeds the Video carousel with eyebrow "Watch", title "Films for the season", no video and backgroundKind surface', async () => {
      await create()
      const carousel = createdBlock('CampaignVideoCarouselBlock')
      expect(carousel).toMatchObject({
        pageId: landingPageId(),
        parentBlockId: null,
        parentOrder: 2,
        eyebrow: 'Watch',
        title: 'Films for the season',
        backgroundKind: 'surface'
      })
      expect(carousel.videoId).toBeUndefined()
    })

    it('seeds the Journey list with eyebrow "Journeys", title, lede, display grid and no items', async () => {
      await create()
      const list = createdBlock(
        'CampaignJourneyListBlock',
        (block) => block.pageId === landingPageId()
      )
      expect(list).toMatchObject({
        parentBlockId: null,
        parentOrder: 3,
        eyebrow: 'Journeys',
        title: 'Ready-made journeys',
        lede: 'Interactive stories your friends can walk through on their phone.',
        display: 'grid',
        backgroundKind: 'none'
      })
      expect(
        createdBlocks().filter((block) => block.parentBlockId === list.id)
      ).toHaveLength(0)
    })

    it('seeds Analytics with eyebrow "Around the world", title, showMap true and backgroundKind contrast', async () => {
      await create()
      expect(
        createdBlock(
          'CampaignAnalyticsBlock',
          (block) => block.pageId === landingPageId()
        )
      ).toMatchObject({
        parentBlockId: null,
        parentOrder: 4,
        eyebrow: 'Around the world',
        title: 'Where the story is spreading',
        showMap: true,
        backgroundKind: 'contrast'
      })
    })
  })

  describe('region page seed', () => {
    it('seeds the Region header with its intro', async () => {
      await create()
      expect(createdBlock('CampaignRegionHeaderBlock')).toMatchObject({
        pageId: regionPageId(),
        parentBlockId: null,
        parentOrder: 0,
        intro:
          'A Christmas journey chosen and contextualised by your regional team.'
      })
    })

    it('seeds the Region share with title, intro and backgroundKind surface', async () => {
      await create()
      expect(createdBlock('CampaignRegionShareBlock')).toMatchObject({
        pageId: regionPageId(),
        parentBlockId: null,
        parentOrder: 1,
        title: 'Share this journey',
        intro: 'Pick a language, preview it, and share the link or QR code.',
        backgroundKind: 'surface'
      })
    })

    it('seeds the Journey list with eyebrow "More journeys", title, display grid and no items', async () => {
      await create()
      const list = createdBlock(
        'CampaignJourneyListBlock',
        (block) => block.pageId === regionPageId()
      )
      expect(list).toMatchObject({
        parentBlockId: null,
        parentOrder: 2,
        eyebrow: 'More journeys',
        title: 'Other journeys for this region',
        display: 'grid'
      })
      expect(list.lede).toBeUndefined()
      expect(
        createdBlocks().filter((block) => block.parentBlockId === list.id)
      ).toHaveLength(0)
    })

    it('seeds Analytics with eyebrow "In this region", title, showMap true and backgroundKind contrast', async () => {
      await create()
      expect(
        createdBlock(
          'CampaignAnalyticsBlock',
          (block) => block.pageId === regionPageId()
        )
      ).toMatchObject({
        parentBlockId: null,
        parentOrder: 3,
        eyebrow: 'In this region',
        title: 'Where the story is spreading',
        showMap: true,
        backgroundKind: 'contrast'
      })
    })

    it('seeds the Region switcher with title "Other regions" and variant cards', async () => {
      await create()
      expect(
        createdBlock(
          'CampaignRegionSwitcherBlock',
          (block) => block.pageId === regionPageId()
        )
      ).toMatchObject({
        parentBlockId: null,
        parentOrder: 4,
        title: 'Other regions',
        switcherVariant: 'cards'
      })
    })

    it('does not seed Featured media, Rich text, Columns or Image', async () => {
      await create()
      const typenames = new Set(createdBlocks().map((block) => block.typename))
      for (const absent of [
        'CampaignFeaturedMediaBlock',
        'CampaignRichTextBlock',
        'CampaignColumnsBlock',
        'CampaignColumnBlock',
        'CampaignImageBlock'
      ]) {
        expect(typenames.has(absent)).toBe(false)
      }
    })
  })

  describe('chrome seed', () => {
    it('seeds the header with backgroundKind none, no logo, null pageId and regionId, and nav buttons Home → hero and Resources → video carousel', async () => {
      await create()
      const header = createdBlock('CampaignHeaderBlock')
      expect(header).toEqual({
        id: expect.any(String),
        typename: 'CampaignHeaderBlock',
        campaignId: 'id-1',
        pageId: null,
        regionId: null,
        parentBlockId: null,
        parentOrder: 0,
        backgroundKind: 'none'
      })
      const nav = createdBlocks().filter(
        (block) => block.parentBlockId === header.id
      )
      expect(nav.map((block) => block.label)).toEqual(['Home', 'Resources'])
      expect(nav.map((block) => block.parentOrder)).toEqual([0, 1])
      for (const button of nav) {
        expect(button).toMatchObject({
          typename: 'CampaignButtonBlock',
          pageId: null,
          regionId: null,
          placement: 'below'
        })
      }
      expect(actionOf(nav[0])).toEqual({
        campaignBlockId: nav[0].id,
        blockId: createdBlock('CampaignHeroBlock').id
      })
      expect(actionOf(nav[1])).toEqual({
        campaignBlockId: nav[1].id,
        blockId: createdBlock('CampaignVideoCarouselBlock').id
      })
    })

    it('creates the scroll targets in the same transaction, before the buttons that point at them', async () => {
      await create()
      const ids = createdBlocks().map((block) => block.id)
      const hero = createdBlock('CampaignHeroBlock')
      const carousel = createdBlock('CampaignVideoCarouselBlock')
      const switcher = createdBlock(
        'CampaignRegionSwitcherBlock',
        (block) => block.pageId === landingPageId()
      )
      for (const action of prismaMock.campaignAction.create.mock.calls.map(
        ([args]) => args.data as { campaignBlockId: string; blockId?: string }
      )) {
        if (action.blockId == null) continue
        expect([hero.id, carousel.id, switcher.id]).toContain(action.blockId)
        expect(ids.indexOf(action.blockId)).toBeLessThan(
          ids.indexOf(action.campaignBlockId)
        )
      }
    })

    it('seeds the footer with backgroundKind surface, a caption "© <creation year> Jesus Film Project" and Terms of Use / Your Privacy text small LinkAction buttons', async () => {
      await create()
      const footer = createdBlock('CampaignFooterBlock')
      expect(footer).toEqual({
        id: expect.any(String),
        typename: 'CampaignFooterBlock',
        campaignId: 'id-1',
        pageId: null,
        regionId: null,
        parentBlockId: null,
        parentOrder: 1,
        backgroundKind: 'surface'
      })
      const children = createdBlocks().filter(
        (block) => block.parentBlockId === footer.id
      )
      expect(children).toHaveLength(3)
      expect(children[0]).toMatchObject({
        typename: 'CampaignTypographyBlock',
        pageId: null,
        regionId: null,
        parentOrder: 0,
        content: '© 2026 Jesus Film Project',
        typographyVariant: 'caption',
        placement: 'below'
      })
      expect(children[0].contentTranslations).toBeUndefined()
      expect(children[1]).toMatchObject({
        typename: 'CampaignButtonBlock',
        parentOrder: 1,
        label: 'Terms of Use',
        buttonVariant: 'text',
        buttonSize: 'small',
        placement: 'below'
      })
      expect(actionOf(children[1])).toEqual({
        campaignBlockId: children[1].id,
        url: 'https://www.cru.org/us/en/about/terms-of-use.html'
      })
      expect(children[2]).toMatchObject({
        typename: 'CampaignButtonBlock',
        parentOrder: 2,
        label: 'Your Privacy',
        buttonVariant: 'text',
        buttonSize: 'small',
        placement: 'below'
      })
      expect(actionOf(children[2])).toEqual({
        campaignBlockId: children[2].id,
        url: 'https://www.cru.org/us/en/about/privacy.html'
      })
    })
  })

  describe('strings seed', () => {
    it('seeds the 17 CampaignString rows with the PRD §14 English wording', async () => {
      await create()
      expect(prismaMock.campaignString.createMany).toHaveBeenCalledTimes(1)
      const rows = firstCallData<
        Array<{ campaignId: string; key: string; value: string }>
      >(prismaMock.campaignString.createMany)
      expect(rows.map(({ key, value }) => ({ key, value }))).toEqual([
        { key: 'allRegions', value: 'All regions' },
        { key: 'step1', value: 'Pick a language your friend understands.' },
        { key: 'step2', value: 'Preview what they will see.' },
        { key: 'step2help', value: 'Tap through the preview like they would.' },
        { key: 'step3', value: 'Share this link with them.' },
        { key: 'step4', value: 'Or download a QR code for print.' },
        { key: 'copy', value: 'Copy link' },
        { key: 'copied', value: 'Link copied' },
        { key: 'downloadQr', value: 'Download QR code' },
        { key: 'open', value: 'Open' },
        { key: 'watch', value: 'Watch' },
        { key: 'openTemplate', value: 'Open journey' },
        { key: 'youtube', value: 'Watch on YouTube' },
        { key: 'totalVisitors', value: 'Total visitors' },
        { key: 'topCountry', value: 'Top country' },
        { key: 'seeAllOnWatch', value: 'See all on Watch' },
        { key: 'videos', value: 'videos' }
      ])
      expect(rows.every((row) => row.campaignId === 'id-1')).toBe(true)
    })

    it("uses the admin i18next bundle's translation when the default language is not English and has that exact string", async () => {
      mockFetchLanguage.mockResolvedValue({ id: '21028', bcp47: 'es' })
      await create({ defaultLanguageId: '21028' })
      const rows = firstCallData<Array<{ key: string; value: string }>>(
        prismaMock.campaignString.createMany
      )
      const byKey = Object.fromEntries(
        rows.map(({ key, value }) => [key, value])
      )
      // "Copy link" exists in the Spanish admin bundle; the other sixteen do
      // not and keep their English wording.
      expect(byKey.copy).toBe('Copiar enlace')
      expect(byKey.allRegions).toBe('All regions')
      expect(byKey.videos).toBe('videos')
    })
  })

  describe('before the transaction', () => {
    it('throws FORBIDDEN for a non-member and writes nothing', async () => {
      prismaMock.team.findUnique.mockResolvedValue(
        campaignFactory({ userId: 'someoneElse' }).build().team
      )
      const result = await create()
      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'user is not allowed to create campaign',
            extensions: expect.objectContaining({ code: 'FORBIDDEN' })
          })
        ]
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.campaign.create).not.toHaveBeenCalled()
    })

    it('throws NOT_FOUND for an unknown team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)
      const result = await create({ teamId: 'missing' })
      expect(result.errors?.[0]?.extensions).toMatchObject({
        code: 'NOT_FOUND'
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('requires a title (BAD_USER_INPUT, field title)', async () => {
      const result = await create({ title: '   ' })
      expect(result.errors?.[0]?.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'title'
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('caps the title at 100 characters (BAD_USER_INPUT, field title)', async () => {
      const result = await create({ title: 'x'.repeat(101) })
      expect(result.errors?.[0]?.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'title'
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('requires the language to exist in api-languages (BAD_USER_INPUT, field defaultLanguageId)', async () => {
      mockFetchLanguage.mockResolvedValue(null)
      const result = await create({ defaultLanguageId: 'nope' })
      expect(mockFetchLanguage).toHaveBeenCalledWith('nope')
      expect(result.errors?.[0]?.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'defaultLanguageId'
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('rolls everything back when a write inside the transaction fails', async () => {
      prismaMock.campaignBlock.create.mockRejectedValueOnce(
        new Error('disk full')
      )
      const result = await create()
      expect(result.data).toBeNull()
      expect(result.errors).toHaveLength(1)
      // Every write runs inside the one transaction callback, so the throw
      // leaves the callback and Prisma discards the earlier writes.
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaign.create).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignString.createMany).not.toHaveBeenCalled()
      expect(prismaMock.campaign.findUniqueOrThrow).not.toHaveBeenCalled()
    })

    it('retries once with a fresh slug on a slug-uniqueness race', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'unique constraint failed',
        { code: 'P2002', clientVersion: '7.0.0', meta: { target: ['slug'] } }
      )
      prismaMock.campaign.create.mockRejectedValueOnce(p2002)
      const result = await create()
      expect(result.errors).toBeUndefined()
      expect(prismaMock.campaign.create).toHaveBeenCalledTimes(2)
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(2)
    })
  })

  describe('response', () => {
    it('returns the full campaign so the editor opens it with no second fetch', async () => {
      const result = await create()
      expect(result.errors).toBeUndefined()
      expect(prismaMock.campaign.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'id-1' } })
      )
      const campaign = result.data.campaignCreate
      expect(campaign).toMatchObject({
        id: 'campaignId',
        title: 'Christmas 2026',
        slug: 'christmas-2026',
        status: 'draft',
        defaultLanguageId: '529',
        palette: LIGHT_PALETTE,
        publishedAt: null,
        languages: [{ languageId: '529', order: 0 }],
        theme: {
          themeMode: 'light',
          headerFont: null,
          bodyFont: null,
          labelFont: null,
          primaryColor: '#C52D3A',
          accentColor: '#F2B544',
          backgroundColor: '#FBF7F1',
          surfaceColor: '#FFFFFF',
          textColor: '#26262E',
          mutedColor: '#6D6F81',
          contrastBackgroundColor: '#26262E',
          contrastTextColor: '#FFFFFF',
          radius: 'rounded',
          buttonRadius: 'pill'
        },
        pages: [{ kind: 'landing' }, { kind: 'regionTemplate' }],
        regions: []
      })
      expect(campaign.strings).toHaveLength(17)
      expect(campaign.blocks).toHaveLength(18)
      expect(campaign.blocks.map((block: any) => block.__typename)).toEqual(
        fixture.blocks.map((block) => block.typename)
      )
      expect(
        campaign.blocks.find((block: any) => block.id === 'heroId')
      ).toEqual({
        __typename: 'CampaignHeroBlock',
        id: 'heroId',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: null,
        parentOrder: 0,
        backgroundKind: 'none',
        eyebrow: 'Christmas 2026',
        title: 'Share the story of Christmas',
        lede: 'Pick your region to find a journey in your language, ready to share.',
        align: 'center',
        mediaBlockId: null
      })
      expect(
        campaign.blocks.find((block: any) => block.id === 'heroButtonId')
      ).toEqual({
        __typename: 'CampaignButtonBlock',
        id: 'heroButtonId',
        pageId: 'landingPageId',
        regionId: null,
        parentBlockId: 'heroId',
        parentOrder: 0,
        label: 'Choose your region',
        buttonVariant: null,
        size: null,
        placement: 'below',
        action: {
          __typename: 'CampaignScrollToBlockAction',
          blockId: 'landingSwitcherId'
        }
      })
      expect(
        campaign.blocks.find((block: any) => block.id === 'headerId')
      ).toEqual({
        __typename: 'CampaignHeaderBlock',
        id: 'headerId',
        pageId: null,
        regionId: null,
        parentBlockId: null,
        parentOrder: 0,
        backgroundKind: 'none',
        logoBlockId: null
      })
      expect(
        campaign.blocks.find((block: any) => block.id === 'footerCopyrightId')
      ).toMatchObject({
        __typename: 'CampaignTypographyBlock',
        content: '© 2026 Jesus Film Project',
        typographyVariant: 'caption',
        placement: 'below'
      })
      expect(
        campaign.blocks.find((block: any) => block.id === 'footerPrivacyId')
      ).toMatchObject({
        __typename: 'CampaignButtonBlock',
        buttonVariant: 'text',
        size: 'small',
        action: {
          __typename: 'CampaignLinkAction',
          url: 'https://www.cru.org/us/en/about/privacy.html'
        }
      })
    })

    it('agrees with campaignFactory row by row', async () => {
      await create()

      // Label every id on both sides by its position in creation order.
      const factoryLabels = new Map<string, string>([
        [fixture.id, 'campaign'],
        ...fixture.pages.map((page): [string, string] => [
          page.id,
          `page:${page.kind}`
        ]),
        ...fixture.blocks.map((block, index): [string, string] => [
          block.id,
          `block:${index}`
        ])
      ])
      const createdPages = prismaMock.campaignPage.create.mock.calls.map(
        ([args]) => args.data as { id: string; kind: string }
      )
      const mutationLabels = new Map<string, string>([
        ['id-1', 'campaign'],
        ...createdPages.map((page): [string, string] => [
          page.id,
          `page:${page.kind}`
        ]),
        ...createdBlocks().map((block, index): [string, string] => [
          block.id as string,
          `block:${index}`
        ])
      ])

      expect(
        createdBlocks().map((block) => normalize(block, mutationLabels))
      ).toEqual(
        fixture.blocks.map(({ action: _action, ...block }) =>
          normalize(block, factoryLabels)
        )
      )

      const createdActions = prismaMock.campaignAction.create.mock.calls.map(
        ([args]) =>
          normalize(args.data as Record<string, unknown>, mutationLabels)
      )
      expect(createdActions).toEqual(
        fixture.blocks
          .filter((block) => block.action != null)
          .map((block) =>
            normalize(block.action as Record<string, unknown>, factoryLabels)
          )
      )

      expect(
        normalize(firstCallData(prismaMock.campaign.create), mutationLabels)
      ).toEqual(
        normalize(
          {
            id: fixture.id,
            teamId: fixture.teamId,
            title: fixture.title,
            slug: fixture.slug,
            status: fixture.status,
            defaultLanguageId: fixture.defaultLanguageId,
            palette: fixture.palette,
            publishedAt: fixture.publishedAt
          },
          factoryLabels
        )
      )
      expect(
        createdPages.map((page) => normalize(page, mutationLabels))
      ).toEqual(fixture.pages.map((page) => normalize(page, factoryLabels)))
      expect(
        prismaMock.campaignLanguage.create.mock.calls.map(([args]) =>
          normalize({ ...(args.data as object), id: null }, mutationLabels)
        )
      ).toEqual(
        fixture.languages.map((language) =>
          normalize({ ...language, id: null }, factoryLabels)
        )
      )
      expect(
        normalize(
          { ...firstCallData(prismaMock.campaignTheme.create), id: null },
          mutationLabels
        )
      ).toEqual(normalize({ ...fixture.theme, id: null }, factoryLabels))
      expect(
        firstCallData<Array<Record<string, unknown>>>(
          prismaMock.campaignString.createMany
        ).map((row) => normalize({ ...row, id: null }, mutationLabels))
      ).toEqual(
        fixture.strings.map((row) =>
          normalize(
            { ...row, id: null, valueTranslations: null },
            factoryLabels
          )
        )
      )
    })
  })
})
