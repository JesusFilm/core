import { randomUUID } from 'node:crypto'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { auth as firebaseAuth } from '@core/yoga/firebaseClient'

import {
  structureAuthUrl,
  structureFixture,
  structureJourneysUrl
} from './grantedStructureFixture'

vi.mock('@core/shared/ui/getLaunchDarklyClient', () => ({
  getLaunchDarklyClient: vi.fn()
}))
vi.mock('@core/yoga/firebaseClient', () => ({ auth: { getUser: vi.fn() } }))

describe('appearance through OAuth, MCP HTTP, gateway and the real Journeys store', () => {
  if (!structureAuthUrl || !structureJourneysUrl)
    throw new Error(
      'Run node tools/scripts/test-mcp-appearance.mjs with isolated issue databases'
    )
  let features = { websiteMode: true, editJourneyTrackingMetrics: true }
  const f = structureFixture({
    issue: process.env.STRUCTURE_TEST_ISSUE ?? '10561',
    startupTimeoutMs: 120000,
    useProductionFeatureGate: true
  })
  const journey = () =>
    f.journeys.journey.findUniqueOrThrow({ where: { id: f.journeyId } })
  const theme = () =>
    f.journeys.journeyTheme.findUnique({ where: { journeyId: f.journeyId } })
  const chats = () =>
    f.journeys.chatButton.findMany({
      where: { journeyId: f.journeyId },
      orderBy: { id: 'asc' }
    })
  async function snapshot() {
    return {
      ...(await f.snapshot()),
      theme: await theme(),
      chats: await chats()
    }
  }
  const denied = (
    result: Awaited<ReturnType<typeof f.edit>>,
    code = 'ACCESS_DENIED_OR_NOT_FOUND'
  ) => {
    expect(result.text).toContain(code)
    expect(result.json.result?.isError).toBe(true)
  }

  beforeEach(() => {
    features = { websiteMode: true, editJourneyTrackingMetrics: true }
    vi.mocked(firebaseAuth.getUser).mockResolvedValue({
      uid: 'alice',
      email: 'alice@synthetic.example',
      displayName: 'Alice'
    } as Awaited<ReturnType<typeof firebaseAuth.getUser>>)
    vi.mocked(getLaunchDarklyClient).mockResolvedValue({
      allFlagsState: async () => ({
        toJSON: () => ({ ...features, aiChatEditor: false })
      })
    } as unknown as Awaited<ReturnType<typeof getLaunchDarklyClient>>)
  })

  const cases = [
    {
      command: {
        type: 'journey_details_set',
        title: 'An updated title',
        description: null,
        languageId: '496'
      },
      expected: {
        title: 'An updated title',
        description: null,
        languageId: '496'
      }
    },
    {
      command: {
        type: 'journey_social_set',
        seoTitle: 's'.repeat(49),
        seoDescription: 'd'.repeat(179)
      },
      expected: { seoTitle: 's'.repeat(49), seoDescription: 'd'.repeat(179) }
    },
    {
      command: { type: 'journey_appearance_set', displayTitle: '' },
      expected: { displayTitle: '' }
    },
    {
      command: { type: 'journey_appearance_set', displayTitle: null },
      expected: { displayTitle: null }
    },
    {
      command: {
        type: 'journey_appearance_set',
        showShareButton: true,
        showLikeButton: true,
        showDislikeButton: true
      },
      expected: {
        showShareButton: true,
        showLikeButton: true,
        showDislikeButton: true
      }
    },
    {
      command: { type: 'journey_appearance_set', website: true },
      expected: { website: true }
    }
  ]

  it.each(cases)(
    'updates supported metadata and appearance, replays and restores safely: $command',
    async ({ command, expected }) => {
      await f.journeys.journey.update({
        where: { id: f.journeyId },
        data: {
          description: 'Prior description',
          displayTitle: 'Prior title',
          seoDescription: 'Prior social description'
        }
      })
      const before = await journey()
      const input = await f.input([command])
      const receipt = f.receipt(await f.edit(input))
      expect(await journey()).toMatchObject(expected)
      expect(f.receipt(await f.edit(input))).toEqual(receipt)
      const admin = await f.adminRead(
        'title description language { id } seoTitle seoDescription displayTitle website showShareButton showLikeButton showDislikeButton'
      )
      expect(admin.errors).toBeUndefined()
      expect(admin.data?.adminJourney).toMatchObject(
        Object.fromEntries(
          Object.entries(expected).filter(([key]) => key !== 'languageId')
        )
      )
      const settings = await f.call('journey_read', {
        journeyId: f.journeyId,
        view: 'settings'
      })
      expect(settings.text).toContain('settings')
      const host = await f.journeys.host.create({
        data: { teamId: before.teamId, title: 'Human changed Host' }
      })
      await f.journeys.journey.update({
        where: { id: f.journeyId },
        data: {
          hostId: host.id,
          creatorDescription: 'Human creator',
          custom1Label: 'Human tracking label'
        }
      })
      f.receipt(await f.historyAction('undo', receipt.historyId!))
      const restored = await journey()
      for (const field of Object.keys(expected))
        expect(restored[field as keyof typeof restored]).toEqual(
          before[field as keyof typeof before]
        )
      expect(restored).toMatchObject({
        hostId: host.id,
        creatorDescription: 'Human creator',
        custom1Label: 'Human tracking label',
        slug: before.slug
      })
      f.receipt(await f.historyAction('redo', receipt.historyId!))
      expect(await journey()).toMatchObject({ ...expected, hostId: host.id })
    }
  )

  it('creates one owned font theme with stable replay/history IDs', async () => {
    const input = await f.input([
      {
        type: 'journey_fonts_set',
        headerFont: 'Oswald',
        bodyFont: 'Nunito',
        labelFont: 'Inter'
      }
    ])
    const receipt = f.receipt(await f.edit(input))
    const created = await theme()
    expect(created).toMatchObject({
      journeyId: f.journeyId,
      userId: 'alice',
      headerFont: 'Oswald',
      bodyFont: 'Nunito',
      labelFont: 'Inter'
    })
    expect(f.receipt(await f.edit(input))).toEqual(receipt)
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    expect(await theme()).toBeNull()
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    expect(await theme()).toMatchObject({
      id: created!.id,
      createdAt: created!.createdAt
    })
    const admin = await f.adminRead(
      'journeyTheme { id headerFont bodyFont labelFont }'
    )
    expect(admin.errors).toBeUndefined()
    expect(admin.data?.adminJourney).toMatchObject({
      journeyTheme: { id: created!.id, headerFont: 'Oswald' }
    })
  })

  it('patches only requested font fields, preserving later body font and owner values', async () => {
    await f.journeys.journeyTheme.create({
      data: {
        journeyId: f.journeyId,
        userId: 'human',
        headerFont: null,
        bodyFont: 'Montserrat',
        labelFont: 'Inter'
      }
    })
    const receipt = await f.save([
      { type: 'journey_fonts_set', headerFont: 'Cinzel' }
    ])
    const updated = await theme()
    await f.journeys.journeyTheme.update({
      where: { id: updated!.id },
      data: { bodyFont: 'Nunito' }
    })
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    expect(await theme()).toMatchObject({
      id: updated!.id,
      userId: 'human',
      headerFont: null,
      bodyFont: 'Nunito',
      labelFont: 'Inter'
    })
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    expect(await theme()).toMatchObject({
      headerFont: 'Cinzel',
      bodyFont: 'Nunito'
    })
  })

  it('creates/removes/restores the complete seven-block menu and reference atomically', async () => {
    for (const [index, suffix] of ['a', 'b', 'c'].entries())
      await f.journeys.block.update({
        where: { id: f.id(suffix) },
        data: { parentOrder: (index + 1) * 10 }
      })
    await f.save([{ type: 'journey_appearance_set', website: true }])
    const input = await f.input([{ type: 'menu_create', key: 'menu' }])
    const receipt = f.receipt(await f.edit(input))
    const menuId = receipt.idMap.menu
    expect(Object.keys(receipt.idMap)).toHaveLength(7)
    expect((await journey()).menuStepBlockId).toBe(menuId)
    const admin = await f.adminRead('menuStepBlock { id }')
    expect(admin.errors).toBeUndefined()
    expect(admin.data?.adminJourney).toMatchObject({
      menuStepBlock: { id: menuId }
    })
    const blocks = await f.journeys.block.findMany({
      where: { id: { in: Object.values(receipt.idMap) } }
    })
    expect(
      blocks.find((block) => block.typename === 'StepBlock')
    ).toMatchObject({ parentOrder: 31 })
    expect(
      await f.journeys.block.findMany({
        where: {
          journeyId: f.journeyId,
          typename: 'StepBlock',
          deletedAt: null
        },
        orderBy: { parentOrder: 'asc' },
        select: { id: true, parentOrder: true }
      })
    ).toEqual([
      { id: f.id('a'), parentOrder: 10 },
      { id: f.id('b'), parentOrder: 20 },
      { id: f.id('c'), parentOrder: 30 },
      { id: menuId, parentOrder: 31 }
    ])
    expect(blocks.map((block) => block.typename).sort()).toEqual(
      [
        'StepBlock',
        'CardBlock',
        'TypographyBlock',
        'TypographyBlock',
        'ButtonBlock',
        'ButtonBlock',
        'ButtonBlock'
      ].sort()
    )
    expect(
      blocks
        .filter((row) => row.typename === 'ButtonBlock')
        .every(
          (row) =>
            row.startIconId === null &&
            row.endIconId === null &&
            row.submitEnabled === false
        )
    ).toBe(true)
    expect(
      blocks.find((row) => row.content === 'Helping people discover Jesus.')
    ).toMatchObject({ variant: 'subtitle2', align: 'center' })
    expect(f.receipt(await f.edit(input))).toEqual(receipt)
    const menuIcon = await f.save([
      { type: 'journey_appearance_set', menuButtonIcon: 'grid1' }
    ])
    f.receipt(await f.historyAction('undo', menuIcon.historyId!))
    f.receipt(await f.historyAction('redo', menuIcon.historyId!))
    await f.journeys.block.update({
      where: { id: f.id('a') },
      data: { nextBlockId: menuId }
    })
    const removed = await f.save([{ type: 'menu_remove' }])
    expect(removed.affectedLinks).toContainEqual({
      sourceBlockId: f.id('a'),
      kind: 'default',
      destinationStepId: menuId
    })
    expect((await journey()).menuStepBlockId).toBeNull()
    expect(
      await f.journeys.block.count({
        where: { id: { in: Object.values(receipt.idMap) }, deletedAt: null }
      })
    ).toBe(0)
    f.receipt(await f.historyAction('undo', removed.historyId!))
    expect((await journey()).menuStepBlockId).toBe(menuId)
    expect(
      await f.journeys.block.count({
        where: { id: { in: Object.values(receipt.idMap) }, deletedAt: null }
      })
    ).toBe(7)
    f.receipt(await f.historyAction('redo', removed.historyId!))
    expect((await journey()).menuStepBlockId).toBeNull()
  })

  it('undoes menu creation with the same IDs and conflicts on later descendant edits', async () => {
    await f.save([{ type: 'journey_appearance_set', website: true }])
    const receipt = await f.save([{ type: 'menu_create', key: 'menu' }])
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    expect((await journey()).menuStepBlockId).toBeNull()
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    await f.journeys.block.update({
      where: { id: receipt.idMap['menu.heading'] },
      data: { content: 'Later human heading' }
    })
    const before = await snapshot()
    denied(
      await f.historyAction('undo', receipt.historyId!),
      'HISTORY_CONFLICT'
    )
    expect(await snapshot()).toEqual(before)
  })

  it('rejects menu insertion beyond the database Step-order bound without effects', async () => {
    await f.save([{ type: 'journey_appearance_set', website: true }])
    await f.journeys.block.update({
      where: { id: f.id('a') },
      data: { parentOrder: 2147483647 }
    })
    const before = await snapshot()
    denied(
      await f.edit(await f.input([{ type: 'menu_create', key: 'menu' }])),
      'VALIDATION_FAILED'
    )
    expect(await snapshot()).toEqual(before)
  })

  it('resolves forward menu references with a full-length batch key and stable descendant IDs', async () => {
    const key = 'm'.repeat(32)
    const input = await f.input([
      { type: 'journey_appearance_set', website: true },
      {
        type: 'step_default_set',
        step: { id: f.id('a') },
        destination: { local: key }
      },
      {
        type: 'typography_set',
        blockId: `$${key}.heading`,
        content: 'An owned menu heading'
      },
      { type: 'menu_create', key }
    ])
    const receipt = f.receipt(await f.edit(input))
    expect((await journey()).menuStepBlockId).toBe(receipt.idMap[key])
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('a') } })
    ).toMatchObject({ nextBlockId: receipt.idMap[key] })
    expect(
      await f.journeys.block.findUnique({
        where: { id: receipt.idMap[`${key}.heading`] }
      })
    ).toMatchObject({ content: 'An owned menu heading' })
    expect(f.receipt(await f.edit(input))).toEqual(receipt)
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    expect(await journey()).toMatchObject({
      website: false,
      menuStepBlockId: null
    })
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('a') } })
    ).toMatchObject({ nextBlockId: f.id('b') })
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    expect((await journey()).menuStepBlockId).toBe(receipt.idMap[key])
  })

  it('rejects an existing menu and a foreign menu reference without changing either journey', async () => {
    await f.save([
      { type: 'journey_appearance_set', website: true },
      { type: 'menu_create', key: 'menu' }
    ])
    let before = await snapshot()
    denied(
      await f.edit(await f.input([{ type: 'menu_create', key: 'duplicate' }])),
      'VALIDATION_FAILED'
    )
    expect(await snapshot()).toEqual(before)
    const foreignId = f.id('foreign-journey')
    const foreignStep = f.id('foreign-step')
    await f.journeys.journey.create({
      data: {
        id: foreignId,
        slug: foreignId,
        title: 'Foreign synthetic draft',
        languageId: '529',
        status: 'draft',
        team: { create: { title: 'Foreign synthetic team' } },
        blocks: {
          create: [
            { id: foreignStep, typename: 'StepBlock', parentOrder: 0 },
            {
              id: f.id('foreign-card'),
              typename: 'CardBlock',
              parentBlockId: foreignStep,
              parentOrder: 0
            }
          ]
        }
      }
    })
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: { menuStepBlockId: foreignStep }
    })
    before = await snapshot()
    const foreign = await f.journeys.block.findMany({
      where: { journeyId: foreignId },
      orderBy: { id: 'asc' }
    })
    denied(await f.edit(await f.input([{ type: 'menu_remove' }])))
    expect(await snapshot()).toEqual(before)
    expect(
      await f.journeys.block.findMany({
        where: { journeyId: foreignId },
        orderBy: { id: 'asc' }
      })
    ).toEqual(foreign)
  })

  it.each(['menu', 'theme'] as const)(
    'rolls back a %s gesture after a child-write error, then permits retry',
    async (kind) => {
      await f.save([{ type: 'journey_appearance_set', website: true }])
      const input = await f.input(
        kind === 'menu'
          ? [
              { type: 'menu_create', key: 'menu' },
              { type: 'journey_fonts_set', bodyFont: 'Inter' }
            ]
          : [
              { type: 'journey_fonts_set', bodyFont: 'Inter' },
              {
                type: 'chat_button_add',
                key: 'chat',
                platform: 'custom',
                link: ''
              }
            ]
      )
      const before = await snapshot()
      let children = 0
      f.checkpoint = async (point) => {
        if (point === 'after_child' && ++children === (kind === 'menu' ? 3 : 1))
          throw new Error('controlled child failure')
      }
      expect((await f.edit(input)).json.result?.isError).toBe(true)
      expect(await snapshot()).toEqual(before)
      f.checkpoint = undefined
      f.receipt(await f.edit(input))
    }
  )

  it('adds, patches, clears and removes owned chat buttons with real inverses and a two-button limit', async () => {
    const receipt = await f.save([
      {
        type: 'chat_button_add',
        key: 'chat',
        platform: 'whatsApp',
        link: 'example.test/chat'
      }
    ])
    const id = receipt.idMap.chat
    expect(await chats()).toMatchObject([
      { id, link: 'https://example.test/chat' }
    ])
    const admin = await f.adminRead('chatButtons { id platform link }')
    expect(admin.errors).toBeUndefined()
    expect(admin.data?.adminJourney).toMatchObject({
      chatButtons: [
        { id, platform: 'whatsApp', link: 'https://example.test/chat' }
      ]
    })
    const changed = await f.save([
      { type: 'chat_button_set', chatButtonId: id, link: null }
    ])
    await f.journeys.chatButton.update({
      where: { id },
      data: { platform: 'telegram', customizable: true }
    })
    f.receipt(await f.historyAction('undo', changed.historyId!))
    expect(await chats()).toMatchObject([
      {
        id,
        platform: 'telegram',
        customizable: true,
        link: 'https://example.test/chat'
      }
    ])
    f.receipt(await f.historyAction('redo', changed.historyId!))
    expect(await chats()).toMatchObject([{ id, link: null }])
    await f.save([
      { type: 'chat_button_add', key: 'second', platform: null, link: '' }
    ])
    const before = await snapshot()
    denied(
      await f.edit(
        await f.input([
          {
            type: 'chat_button_add',
            key: 'third',
            platform: 'custom',
            link: ''
          }
        ])
      ),
      'VALIDATION_FAILED'
    )
    expect(await snapshot()).toEqual(before)
    const removed = await f.save([
      { type: 'chat_button_remove', chatButtonId: id }
    ])
    f.receipt(await f.historyAction('undo', removed.historyId!))
    expect(await chats()).toHaveLength(2)
    f.receipt(await f.historyAction('redo', removed.historyId!))
    expect(await chats()).toHaveLength(1)
    denied(
      await f.edit(
        await f.input([
          { type: 'chat_button_set', chatButtonId: 'foreign', link: '' }
        ])
      )
    )
  })

  it.each(['ac', 'button', 'yes', 'video'])(
    'sets/clears mounted tracking for %s and preserves unrelated fields in history',
    async (suffix) => {
      const blockId = f.id(suffix)
      const receipt = await f.save([
        {
          type: 'tracking_set',
          block: { id: blockId },
          eventLabel: 'prayerRequest',
          ...(suffix === 'video'
            ? { endEventLabel: 'specialVideoComplete' }
            : {})
        }
      ])
      expect(
        await f.journeys.block.findUnique({ where: { id: blockId } })
      ).toMatchObject({ eventLabel: 'prayerRequest' })
      const admin = await f.adminRead(
        'blocks { id ... on CardBlock { eventLabel } ... on ButtonBlock { eventLabel } ... on RadioOptionBlock { eventLabel } ... on VideoBlock { eventLabel endEventLabel } }'
      )
      expect(admin.errors).toBeUndefined()
      expect(JSON.stringify(admin.data)).toContain('prayerRequest')
      f.receipt(await f.historyAction('undo', receipt.historyId!))
      expect(
        await f.journeys.block.findUnique({ where: { id: blockId } })
      ).toMatchObject({ eventLabel: null })
      f.receipt(await f.historyAction('redo', receipt.historyId!))
      await f.save([
        {
          type: 'tracking_set',
          block: { id: blockId },
          eventLabel: null,
          ...(suffix === 'video' ? { endEventLabel: null } : {})
        }
      ])
      expect(
        await f.journeys.block.findUnique({ where: { id: blockId } })
      ).toMatchObject({ eventLabel: null })
    }
  )

  it.each(['websiteMode', 'editJourneyTrackingMetrics'] as const)(
    'checks current %s at edit acceptance and in history',
    async (feature) => {
      const command =
        feature === 'websiteMode'
          ? { type: 'journey_appearance_set', website: true }
          : {
              type: 'tracking_set',
              block: { id: f.id('ac') },
              eventLabel: 'share'
            }
      const before = await snapshot()
      f.checkpoint = async (point) => {
        if (point === 'before_accept') features[feature] = false
      }
      denied(await f.edit(await f.input([command])))
      expect(await snapshot()).toEqual(before)
      f.checkpoint = undefined
      features[feature] = true
      const receipt = await f.save([command])
      features[feature] = false
      const committed = await snapshot()
      denied(await f.historyAction('undo', receipt.historyId!))
      expect(await snapshot()).toEqual(committed)
    }
  )

  it.each(cases)(
    'rejects stale, read-only, role-ineligible and published writes without effects: $command',
    async ({ command }) => {
      const before = await snapshot()
      const input = await f.input([command])
      denied(
        await f.edit({ ...input, expectedRevision: '0' }),
        'REVISION_CONFLICT'
      )
      const readOnly = await f.consent('view')
      denied(await f.edit(input, readOnly))
      await f.journeys.userTeam.delete({
        where: {
          teamId_userId: { teamId: (await journey()).teamId, userId: 'alice' }
        }
      })
      denied(await f.edit(input))
      await f.journeys.userTeam.create({
        data: {
          teamId: (await journey()).teamId,
          userId: 'alice',
          role: 'manager'
        }
      })
      expect(await snapshot()).toEqual(before)
      await f.journeys.journey.update({
        where: { id: f.journeyId },
        data: {
          status: 'published',
          publishedAt: new Date(),
          firstPublishedAt: new Date()
        }
      })
      const published = await snapshot()
      expect((await f.edit(await f.input([command]))).text).toMatch(
        /NOT_EDITABLE|ACCESS_DENIED_OR_NOT_FOUND/
      )
      expect(await snapshot()).toEqual(published)
    }
  )

  it('rejects hidden Host, creator, lifecycle and foreign menu fields even for a team manager', async () => {
    const before = await snapshot()
    for (const forbidden of [
      { hostId: null },
      { host: { create: { title: 'Host' } } },
      { creatorDescription: 'Creator' },
      { template: true },
      { status: 'published' },
      { slug: 'public' },
      { menuStepBlockId: 'foreign' },
      { plausibleToken: 'secret' }
    ]) {
      denied(
        await f.edit(
          await f.input([{ type: 'journey_appearance_set', ...forbidden }])
        ),
        'VALIDATION_FAILED'
      )
    }
    expect(await snapshot()).toEqual(before)
  })

  it('enforces the mounted required title and social text bounds without effects', async () => {
    const before = await snapshot()
    for (const command of [
      { type: 'journey_details_set', title: '' },
      { type: 'journey_social_set', seoTitle: 'a'.repeat(50) },
      { type: 'journey_social_set', seoDescription: 'b'.repeat(180) }
    ])
      denied(await f.edit(await f.input([command])), 'VALIDATION_FAILED')
    expect(await snapshot()).toEqual(before)
  })

  it('preserves later title changes on affected-field undo conflict', async () => {
    const receipt = await f.save([
      { type: 'journey_details_set', title: 'Agent title' }
    ])
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: { title: 'Human title' }
    })
    const before = await snapshot()
    denied(
      await f.historyAction('undo', receipt.historyId!),
      'HISTORY_CONFLICT'
    )
    expect(await snapshot()).toEqual(before)
  })

  it('scopes website Card slugs to Steps and rejects disabled and unavailable controls', async () => {
    await f.save([{ type: 'journey_appearance_set', website: true }])
    const receipt = await f.save([
      { type: 'card_slug_set', step: { id: f.id('a') }, slug: 'Learn More!' }
    ])
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('a') } })
    ).toMatchObject({ slug: 'learn-more' })
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('ac') } })
    ).toMatchObject({ slug: null })
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    for (const command of [
      { type: 'card_slug_set', step: { id: f.id('b') }, slug: 'learn-more' },
      { type: 'card_slug_set', step: { id: f.id('ac') }, slug: 'other' },
      { type: 'journey_appearance_set', showShareButton: true },
      {
        type: 'tracking_set',
        block: { id: f.id('heading') },
        eventLabel: 'share'
      },
      {
        type: 'tracking_set',
        block: { id: f.id('ac') },
        endEventLabel: 'share'
      }
    ]) {
      const before = await snapshot()
      expect(
        (await f.edit(await f.input([command]))).json.result?.isError
      ).toBe(true)
      expect(await snapshot()).toEqual(before)
    }
    features.websiteMode = false
    for (const command of [
      { type: 'card_slug_set', step: { id: f.id('b') }, slug: '' },
      { type: 'journey_appearance_set', menuButtonIcon: null },
      { type: 'menu_create', key: 'menu' },
      { type: 'menu_remove' }
    ])
      denied(await f.edit(await f.input([command])))
    denied(await f.historyAction('undo', receipt.historyId!))
    features.websiteMode = true
    const cleared = await f.save([
      { type: 'card_slug_set', step: { id: f.id('a') }, slug: '' }
    ])
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('a') } })
    ).toMatchObject({ slug: null })
    f.receipt(await f.historyAction('undo', cleared.historyId!))
  })

  it('supports sparse font commands in one batch and rejects duplicate fields without effects', async () => {
    await f.save([
      { type: 'journey_fonts_set', headerFont: 'Inter' },
      { type: 'journey_fonts_set', bodyFont: 'Nunito' }
    ])
    expect(await theme()).toMatchObject({
      headerFont: 'Inter',
      bodyFont: 'Nunito'
    })
    for (const commands of [
      [
        { type: 'journey_fonts_set', headerFont: 'Inter' },
        { type: 'journey_fonts_set', headerFont: 'Oswald' }
      ],
      [
        { type: 'journey_details_set', title: 'A' },
        { type: 'journey_details_set', title: 'B' }
      ],
      [
        { type: 'chat_button_add', key: 'chat', platform: null, link: '' },
        { type: 'chat_button_add', key: 'chat', platform: null, link: '' }
      ]
    ]) {
      const before = await snapshot()
      denied(await f.edit(await f.input(commands)), 'VALIDATION_FAILED')
      expect(await snapshot()).toEqual(before)
    }
    const before = await f.counts()
    const noop = await f.save([
      { type: 'journey_fonts_set', headerFont: 'Inter' }
    ])
    expect(noop.historyId).toBeNull()
    expect(await f.counts()).toMatchObject({
      history: before.history,
      effects: before.effects
    })
  })

  it('replays website mode and a Step slug together through full undo and redo', async () => {
    await f.journeys.block.update({
      where: { id: f.id('a') },
      data: { slug: 'prior-slug' }
    })
    const receipt = await f.save([
      { type: 'journey_appearance_set', website: true },
      { type: 'card_slug_set', step: { id: f.id('a') }, slug: 'Learn More' }
    ])
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    expect(await journey()).toMatchObject({ website: false })
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('a') } })
    ).toMatchObject({ slug: 'prior-slug' })
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    expect(await journey()).toMatchObject({ website: true })
    expect(
      await f.journeys.block.findUnique({ where: { id: f.id('a') } })
    ).toMatchObject({ slug: 'learn-more' })
  })

  it('restores reaction settings together with their recorded website-mode transition', async () => {
    await f.save([{ type: 'journey_appearance_set', website: true }])
    const receipt = await f.save([
      { type: 'journey_appearance_set', website: false, showShareButton: true }
    ])
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    expect(await journey()).toMatchObject({
      website: true,
      showShareButton: false
    })
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    expect(await journey()).toMatchObject({
      website: false,
      showShareButton: true
    })
  })

  it('rechecks menu eligibility when generic Step removal clears the owning reference', async () => {
    await f.save([{ type: 'journey_appearance_set', website: true }])
    const created = await f.save([{ type: 'menu_create', key: 'menu' }])
    const command = { type: 'step_remove', step: { id: created.idMap.menu } }
    features.websiteMode = false
    let before = await snapshot()
    denied(await f.edit(await f.input([command])))
    expect(await snapshot()).toEqual(before)
    features.websiteMode = true
    await f.save([{ type: 'journey_appearance_set', website: false }])
    before = await snapshot()
    denied(await f.edit(await f.input([command])), 'VALIDATION_FAILED')
    expect(await snapshot()).toEqual(before)
    await f.save([{ type: 'journey_appearance_set', website: true }])
    const removed = await f.save([command])
    expect((await journey()).menuStepBlockId).toBeNull()
    f.receipt(await f.historyAction('undo', removed.historyId!))
    expect((await journey()).menuStepBlockId).toBe(created.idMap.menu)
  })

  it('preserves later chat and font changes instead of removing newly created rows during undo', async () => {
    const created = await f.save([
      { type: 'chat_button_add', key: 'chat', platform: 'custom', link: '' },
      { type: 'journey_fonts_set', headerFont: 'Inter' }
    ])
    await f.journeys.chatButton.update({
      where: { id: created.idMap.chat },
      data: { platform: 'signal' }
    })
    const before = await snapshot()
    denied(
      await f.historyAction('undo', created.historyId!),
      'HISTORY_CONFLICT'
    )
    expect(await snapshot()).toEqual(before)
    await f.journeys.chatButton.update({
      where: { id: created.idMap.chat },
      data: { platform: 'custom' }
    })
    await f.journeys.journeyTheme.update({
      where: { journeyId: f.journeyId },
      data: { bodyFont: 'Nunito' }
    })
    denied(
      await f.historyAction('undo', created.historyId!),
      'HISTORY_CONFLICT'
    )
    expect(await theme()).toMatchObject({
      headerFont: 'Inter',
      bodyFont: 'Nunito'
    })
  })

  it('keeps existing chat IDs independent of font ownership in a mixed batch', async () => {
    await f.journeys.chatButton.create({
      data: {
        id: 'theme',
        journeyId: f.journeyId,
        platform: 'custom',
        link: 'https://example.test/chat'
      }
    })
    const receipt = await f.save([
      { type: 'journey_fonts_set', headerFont: 'Inter' },
      { type: 'chat_button_remove', chatButtonId: 'theme' }
    ])
    expect(await theme()).toMatchObject({ headerFont: 'Inter' })
    expect(await chats()).toEqual([])
    f.receipt(await f.historyAction('undo', receipt.historyId!))
    expect(await theme()).toBeNull()
    expect(await chats()).toMatchObject([
      { id: 'theme', link: 'https://example.test/chat' }
    ])
    f.receipt(await f.historyAction('redo', receipt.historyId!))
    expect(await theme()).toMatchObject({ headerFont: 'Inter' })
    expect(await chats()).toEqual([])
  })

  it('restores a removed chat only within the current limit and rejects affected-link history conflicts', async () => {
    const created = await f.save([
      { type: 'chat_button_add', key: 'one', platform: 'custom', link: '' },
      { type: 'chat_button_add', key: 'two', platform: 'custom', link: '' }
    ])
    const removed = await f.save([
      { type: 'chat_button_remove', chatButtonId: created.idMap.one }
    ])
    await f.journeys.chatButton.create({
      data: { journeyId: f.journeyId, platform: 'telegram' }
    })
    const before = await snapshot()
    denied(
      await f.historyAction('undo', removed.historyId!),
      'HISTORY_CONFLICT'
    )
    expect(await snapshot()).toEqual(before)
    const changed = await f.save([
      {
        type: 'chat_button_set',
        chatButtonId: created.idMap.two,
        platform: null,
        link: 'tel:+15555550100'
      }
    ])
    await f.journeys.chatButton.update({
      where: { id: created.idMap.two },
      data: { link: 'https://human.example.test' }
    })
    denied(
      await f.historyAction('undo', changed.historyId!),
      'HISTORY_CONFLICT'
    )
  })

  it('rejects a revoked edit grant for every new command family without data effects', async () => {
    await f.auth.agentConnection.updateMany({
      where: { userId: 'alice' },
      data: { revokedAt: new Date() }
    })
    const before = await snapshot()
    for (const command of [
      { type: 'journey_fonts_set', headerFont: 'Inter' },
      { type: 'journey_social_set', seoTitle: 'Social' },
      { type: 'journey_details_set', title: 'Title' },
      { type: 'journey_appearance_set', website: true },
      { type: 'menu_create', key: 'menu' },
      { type: 'menu_remove' },
      { type: 'chat_button_add', key: 'chat', platform: 'custom', link: '' },
      { type: 'chat_button_set', chatButtonId: 'foreign', link: '' },
      { type: 'chat_button_remove', chatButtonId: 'foreign' },
      { type: 'tracking_set', block: { id: f.id('ac') }, eventLabel: null }
    ])
      expect(
        (await f.edit(await f.input([command]))).json.result?.isError
      ).toBe(true)
    expect(await snapshot()).toEqual(before)
  })

  it('recovers a lost font/chat response through exact replay and rejects a reused key', async () => {
    const input = await f.input(
      [
        { type: 'journey_fonts_set', headerFont: 'Inter' },
        {
          type: 'chat_button_add',
          key: 'chat',
          platform: 'custom',
          link: 'hello@example.test'
        }
      ],
      randomUUID()
    )
    f.loseNextResponse()
    expect((await f.edit(input)).json.result?.isError).toBe(true)
    const receipt = f.receipt(await f.edit(input))
    expect(await chats()).toHaveLength(1)
    expect(await theme()).not.toBeNull()
    expect(f.receipt(await f.edit(input))).toEqual(receipt)
    denied(
      await f.edit({
        ...input,
        commands: [{ type: 'journey_fonts_set', headerFont: 'Oswald' }]
      }),
      'IDEMPOTENCY_KEY_REUSED'
    )
  })
})
