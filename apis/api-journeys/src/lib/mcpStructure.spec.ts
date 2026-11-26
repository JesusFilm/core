import { mockDeep } from 'vitest-mock-extended'

import { Prisma } from '@core/prisma/journeys/client'
import type { CardStarterCommand } from '@core/yoga/mcp/cardStarterContract'
import { editInput } from '@core/yoga/mcp/editContract'
import { type ReadyMedia, mediaSourceKey } from '@core/yoga/mcp/mediaContract'

import { planStructure } from './mcpStructure'
import { planStructureHistory } from './mcpStructureHistory'
import {
  type ActionState,
  type BlockState,
  emptyAction,
  emptyBlock
} from './mcpStructureState'

const journey = {
  id: 'journey',
  website: false,
  menuStepBlockId: null,
  socialNodeX: null,
  socialNodeY: null
}
const tx = mockDeep<Prisma.TransactionClient>()
function row(
  id: string,
  typename: string,
  parentBlockId: string | null,
  parentOrder: number | null,
  patch: Partial<BlockState> = {}
) {
  return {
    ...emptyBlock(journey.id, typename, id),
    parentBlockId,
    parentOrder,
    ...patch
  }
}
function readRows(blocks: BlockState[], actions: ActionState[] = []) {
  tx.block.findMany.mockResolvedValue(
    blocks.map((block) => ({
      ...block,
      deletedAt:
        typeof block.deletedAt === 'string' ? new Date(block.deletedAt) : null,
      updatedAt: new Date('2026-11-17T00:00:00Z'),
      action: actions.find((action) => action.parentBlockId === block.id)
        ? {
            ...actions.find((action) => action.parentBlockId === block.id)!,
            updatedAt: new Date('2026-11-17T00:00:00Z')
          }
        : null
    })) as unknown as Prisma.BlockGetPayload<{ include: { action: true } }>[]
  )
}
const end = { position: 'end' } as const
function base() {
  return [
    row('a', 'StepBlock', null, 0, { nextBlockId: 'b' }),
    row('ac', 'CardBlock', 'a', 0),
    row('text', 'TypographyBlock', 'ac', 0, {
      content: 'Human text',
      settings: { color: '#123456', tracking: 'original' }
    }),
    row('poll', 'RadioQuestionBlock', 'ac', 1),
    row('yes', 'RadioOptionBlock', 'poll', 0),
    row('no', 'RadioOptionBlock', 'poll', 1),
    row('b', 'StepBlock', null, 1, { nextBlockId: null }),
    row('bc', 'CardBlock', 'b', 0),
    row('button', 'ButtonBlock', 'bc', 0, {
      submitEnabled: false,
      startIconId: 'icon',
      endIconId: 'endicon'
    }),
    row('icon', 'IconBlock', 'button', null, { name: 'ArrowForwardRounded' }),
    row('endicon', 'IconBlock', 'button', null),
    row('c', 'StepBlock', null, 2),
    row('cc', 'CardBlock', 'c', 0)
  ]
}
function action(id: string, target: string): ActionState {
  return { ...emptyAction(id), blockId: target, parentStepId: 'a' }
}
type StructureCommands = Parameters<typeof planStructure>[2]

async function plan(commands: StructureCommands) {
  return planStructure(tx, journey, commands)
}

describe('owning structure planner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tx.block.findFirst.mockResolvedValue(null)
    readRows(base(), [action('yes', 'b'), action('no', 'c')])
  })

  describe('Card starters', () => {
    const imageSource = { source: 'unsplash', id: 'starter-image' } as const
    const videoSource = {
      source: 'internal',
      videoId: '1_jf-0-0',
      languageId: '529'
    } as const
    const media = {
      website: false,
      websiteMode: false,
      sources: new Map<string, ReadyMedia>([
        [
          mediaSourceKey(imageSource),
          {
            kind: 'image',
            src: 'https://images.unsplash.com/starter-image',
            width: 1200,
            height: 800,
            blurhash: 'trusted-blurhash'
          }
        ],
        [
          mediaSourceKey(videoSource),
          {
            kind: 'video',
            source: 'internal',
            videoId: videoSource.videoId,
            videoVariantLanguageId: videoSource.languageId,
            title: null,
            description: null,
            image: null,
            duration: 3600,
            subtitleLanguageIds: [],
            subtitleStatus: 'unavailable'
          }
        ]
      ])
    }
    const card = { local: 'new_card' }
    const examples = [
      [{ kind: 'video', source: videoSource }, ['VideoBlock']],
      [
        { kind: 'intro', source: videoSource },
        ['TypographyBlock', 'TypographyBlock', 'TypographyBlock', 'ButtonBlock']
      ],
      [
        { kind: 'poll', source: imageSource, options: ['A', 'B', 'C', 'D'] },
        [
          'TypographyBlock',
          'TypographyBlock',
          'RadioQuestionBlock',
          'TypographyBlock'
        ]
      ],
      [
        { kind: 'form', source: imageSource, submitLabel: 'Send prayer' },
        [
          'TypographyBlock',
          'TypographyBlock',
          'TextResponseBlock',
          'ButtonBlock',
          'TypographyBlock'
        ]
      ],
      [
        { kind: 'quote', source: imageSource, quote: 'A substituted quote' },
        ['TypographyBlock', 'TypographyBlock', 'TypographyBlock']
      ],
      [
        { kind: 'cta', source: imageSource },
        [
          'TypographyBlock',
          'TypographyBlock',
          'ButtonBlock',
          'ButtonBlock',
          'ButtonBlock'
        ]
      ]
    ] satisfies Array<[CardStarterCommand['starter'], string[]]>

    it.each(
      examples.map(([starter, types]) => ({
        kind: starter.kind,
        starter,
        types
      }))
    )(
      'plans the $kind recipe on a Card created in the same batch',
      async ({ starter, types }) => {
        const commands = editInput.parse({
          journeyId: journey.id,
          expectedRevision: '0',
          idempotencyKey: 'apply-card-starter-recipe',
          commands: [
            {
              type: 'step_add',
              key: 'new_step',
              cardKey: card.local,
              placement: end
            },
            { type: 'card_starter_apply', card, key: 'starter', starter }
          ]
        }).commands
        const plan = await planStructure(tx, journey, commands, media)
        const created = plan.blockWrites.flatMap((write) =>
          write.create ? [write.create] : []
        )
        const target = created.find((block) => block.id === plan.idMap.new_card)
        const content = created
          .filter(
            (block) =>
              block.parentBlockId === target?.id && block.parentOrder !== null
          )
          .sort(
            (first, second) =>
              Number(first.parentOrder) - Number(second.parentOrder)
          )
        expect(content.map((block) => block.typename)).toEqual(types)
        expect(plan.changes).toHaveLength(1)
        expect(plan.changes[0].media).toBe(true)
        expect(plan.actionWrites).toEqual([])

        if (starter.kind === 'video') {
          expect(content[0]).toMatchObject({
            startAt: 2048,
            endAt: 2058,
            autoplay: true,
            muted: false
          })
        } else {
          expect(
            created.find((block) => block.id === target?.coverBlockId)
          ).toMatchObject({
            parentBlockId: target?.id,
            parentOrder: null,
            typename: starter.kind === 'intro' ? 'VideoBlock' : 'ImageBlock'
          })
        }
        if (['poll', 'form', 'quote'].includes(starter.kind))
          expect(content.at(-1)).toMatchObject({ color: 'secondary' })
        if (starter.kind === 'form') {
          expect(content[3]).toMatchObject({
            submitEnabled: true,
            label: 'Send prayer'
          })
          expect(
            created.filter((block) => block.parentBlockId === content[3].id)
          ).toHaveLength(2)
        }
        if (starter.kind === 'poll') {
          expect(
            created
              .filter((block) => block.parentBlockId === content[2].id)
              .sort(
                (first, second) =>
                  Number(first.parentOrder) - Number(second.parentOrder)
              )
              .map((block) => block.label)
          ).toEqual(['A', 'B', 'C', 'D'])
        }
        if (starter.kind === 'quote') {
          expect(target).toMatchObject({
            fullscreen: false,
            themeMode: 'dark',
            themeName: 'base'
          })
          expect(content[1].content).toBe('A substituted quote')
        }
        if (starter.kind === 'intro' || starter.kind === 'cta') {
          const iconNames = created
            .filter((block) => block.typename === 'IconBlock')
            .map((block) => block.name)
          expect(iconNames).toContain('ArrowForwardRounded')
          if (starter.kind === 'cta') {
            expect(iconNames).toContain('ChatBubbleOutlineRounded')
            expect(iconNames).toContain('SendRounded')
          }
        }
      }
    )

    it('rejects a populated target even if the batch also removes its content', async () => {
      const commands: StructureCommands = [
        { type: 'block_remove', block: { id: 'text' } },
        {
          type: 'card_starter_apply',
          card: { id: 'ac' },
          key: 'starter',
          starter: { kind: 'quote', source: imageSource }
        }
      ]
      await expect(planStructure(tx, journey, commands, media)).rejects.toThrow(
        'VALIDATION_FAILED'
      )
    })

    it('accepts an existing empty Card and rejects a source missing from the authorized projection', async () => {
      readRows([row('a', 'StepBlock', null, 0), row('ac', 'CardBlock', 'a', 0)])
      const command: CardStarterCommand = {
        type: 'card_starter_apply',
        card: { id: 'ac' },
        key: 'starter',
        starter: { kind: 'quote', source: imageSource }
      }
      await expect(
        planStructure(tx, journey, [command], media)
      ).resolves.toMatchObject({
        idMap: { starter_title: expect.any(String) }
      })
      await expect(
        planStructure(tx, journey, [command], { ...media, sources: new Map() })
      ).rejects.toThrow('ACCESS_DENIED_OR_NOT_FOUND')
      expect(tx.block.create).not.toHaveBeenCalled()
    })
  })

  it('attaches media to a poll option created in the same form batch', async () => {
    const source = { source: 'unsplash' as const, id: 'poll-image' }
    const { commands } = editInput.parse({
      journeyId: journey.id,
      expectedRevision: '0',
      idempotencyKey: 'combined-form-media-edit',
      commands: [
        {
          type: 'poll_option_add',
          question: { id: 'poll' },
          key: 'maybe',
          label: 'Maybe',
          placement: end
        },
        {
          type: 'media_slot_set',
          target: { slot: 'poll', owner: { local: 'maybe' } },
          media: { kind: 'image', source, alt: 'A new option image' }
        }
      ]
    })
    const result = await planStructure(tx, journey, commands, {
      website: false,
      websiteMode: false,
      sources: new Map([
        [
          mediaSourceKey(source),
          {
            kind: 'image',
            src: 'https://images.unsplash.com/poll-image',
            width: 1200,
            height: 800,
            blurhash: 'trusted-blurhash'
          }
        ]
      ])
    })
    const option = result.blockWrites.find(
      (write) => write.id === result.idMap.maybe
    )?.create
    expect(option).toMatchObject({
      typename: 'RadioOptionBlock',
      parentBlockId: 'poll',
      parentOrder: 2,
      label: 'Maybe',
      pollOptionImageBlockId: expect.any(String)
    })
    expect(
      result.blockWrites.find(
        (write) => write.id === option?.pollOptionImageBlockId
      )?.create
    ).toMatchObject({
      typename: 'ImageBlock',
      parentBlockId: result.idMap.maybe,
      src: 'https://images.unsplash.com/poll-image',
      alt: 'A new option image'
    })
    expect(result.changes[0].media).toBe(true)
  })

  it('resolves forward placement anchors and rejects cyclic placement dependencies', async () => {
    const commands: StructureCommands = [
      {
        type: 'step_add',
        key: 'first',
        cardKey: 'first_card',
        placement: { position: 'before', anchor: { local: 'last' } }
      },
      { type: 'step_add', key: 'last', cardKey: 'last_card', placement: end }
    ]
    const result = await plan(commands)
    expect(
      result.blockWrites.find((write) => write.id === result.idMap.first)
        ?.create?.parentOrder
    ).toBe(3)
    expect(
      result.blockWrites.find((write) => write.id === result.idMap.last)?.create
        ?.parentOrder
    ).toBe(4)
    await expect(
      plan([
        commands[0],
        {
          type: 'step_add',
          key: 'last',
          cardKey: 'last_card',
          placement: { position: 'after', anchor: { local: 'first' } }
        }
      ])
    ).rejects.toThrow('VALIDATION_FAILED')
  })

  it('rejects a newly assigned Step with an invalid owning parent or missing Card', async () => {
    for (const target of [
      row('bad', 'StepBlock', 'ac', 2),
      row('bad', 'StepBlock', null, 3)
    ]) {
      readRows([...base(), target])
      await expect(
        plan([
          {
            type: 'step_default_set',
            step: { id: 'a' },
            destination: { id: 'bad' }
          }
        ])
      ).rejects.toThrow('VALIDATION_FAILED')
    }
  })

  it.each(['existing', 'local'] as const)(
    'rejects a default self continuation using %s references',
    async (reference) => {
      await expect(
        plan(
          reference === 'existing'
            ? [
                { type: 'step_position_set', step: { id: 'a' }, x: 1, y: 2 },
                {
                  type: 'step_default_set',
                  step: { id: 'a' },
                  destination: { id: 'a' }
                }
              ]
            : [
                {
                  type: 'step_default_set',
                  step: { local: 'new' },
                  destination: { local: 'new' }
                },
                {
                  type: 'step_add',
                  key: 'new',
                  cardKey: 'new_card',
                  placement: end
                }
              ]
        )
      ).rejects.toThrow('VALIDATION_FAILED')
    }
  )

  it.each([
    'content',
    'settings',
    'action-change',
    'action-add',
    'action-remove'
  ])('refuses redo that would hide a newer subtree %s edit', async (edit) => {
    const initial = [
      ...base(),
      row('btext', 'TypographyBlock', 'bc', 1, { content: 'Original heading' })
    ]
    const initialActions = [action('yes', 'b'), action('no', 'c')]
    if (edit !== 'action-add') initialActions.push(action('button', 'c'))
    readRows(initial, initialActions)
    const saved = await plan([{ type: 'step_remove', step: { id: 'b' } }])
    const current = initial.map((block) =>
      block.id === 'btext'
        ? {
            ...block,
            ...(edit === 'content' ? { content: 'New human heading' } : {}),
            ...(edit === 'settings'
              ? { settings: { human: 'New setting' } }
              : {})
          }
        : block
    )
    const currentActions = initialActions.filter(
      (item) => item.parentBlockId !== 'button'
    )
    if (edit !== 'action-remove')
      currentActions.push(
        action('button', edit === 'action-change' ? 'a' : 'c')
      )
    readRows(current, currentActions)
    await expect(
      planStructureHistory(tx, journey, saved.changes, 'redo')
    ).rejects.toThrow('HISTORY_CONFLICT')
  })

  it('keeps all incoming route rows unchanged in a delete-only plan and reports them', async () => {
    const result = await plan([{ type: 'step_remove', step: { id: 'b' } }])
    expect(result.actionWrites).toEqual([])
    expect(result.blockWrites.find((write) => write.id === 'a')).toBeUndefined()
    expect(result.affectedLinks).toEqual([
      { sourceBlockId: 'a', kind: 'default', destinationStepId: 'b' },
      { sourceBlockId: 'yes', kind: 'action', destinationStepId: 'b' }
    ])
    expect(
      result.blockWrites.filter((write) => write.patch.deletedAt)
    ).toHaveLength(5)
    expect(
      result.changes[0].blocks.filter((change) => change.id === 'a')
    ).toEqual([])
  })

  it('resolves a forward local target and creates complete button icons before execution', async () => {
    const result = await plan([
      {
        type: 'action_set',
        block: { id: 'yes' },
        action: { kind: 'step', destination: { local: 'new' } }
      },
      {
        type: 'step_add',
        key: 'new',
        cardKey: 'new_card',
        placement: end,
        content: [
          { key: 'new_button', content: { kind: 'button', label: 'Next' } }
        ]
      }
    ])
    expect(result.idMap).toMatchObject({
      new: expect.any(String),
      new_card: expect.any(String),
      new_button: expect.any(String)
    })
    const button = result.blockWrites.find(
      (write) => write.id === result.idMap.new_button
    )!.create!
    expect(button).toMatchObject({
      parentBlockId: result.idMap.new_card,
      label: 'Next',
      submitEnabled: false
    })
    expect(
      result.blockWrites.filter(
        (write) => write.create?.typename === 'IconBlock'
      )
    ).toHaveLength(2)
    expect(
      result.actionWrites.find((write) => write.id === 'yes')?.value?.blockId
    ).toBe(result.idMap.new)
  })

  it('keeps declaration order for repeated insertion after one anchor', async () => {
    const result = await plan([
      {
        type: 'step_add',
        key: 'first',
        cardKey: 'first_card',
        placement: { position: 'after', anchor: { id: 'a' } }
      },
      {
        type: 'step_add',
        key: 'second',
        cardKey: 'second_card',
        placement: { position: 'after', anchor: { id: 'a' } }
      }
    ])
    expect(
      result.blockWrites.find((write) => write.id === result.idMap.first)
        ?.create?.parentOrder
    ).toBe(1)
    expect(
      result.blockWrites.find((write) => write.id === result.idMap.second)
        ?.create?.parentOrder
    ).toBe(2)
  })

  it('rejects newly assigned routes to a Step deleted later in the same batch', async () => {
    await expect(
      plan([
        {
          type: 'action_set',
          block: { id: 'no' },
          action: { kind: 'step', destination: { id: 'b' } }
        },
        { type: 'step_remove', step: { id: 'b' } }
      ])
    ).rejects.toThrow('ACCESS_DENIED_OR_NOT_FOUND')
  })

  it('rejects a destructive overlap even when the child edit is a no-op', async () => {
    await expect(
      plan([
        { type: 'typography_set', blockId: 'text', content: 'Human text' },
        { type: 'step_remove', step: { id: 'a' } }
      ])
    ).rejects.toThrow('VALIDATION_FAILED')
  })

  it('copies a complete Step with new owned icon references and the source default cleared', async () => {
    const result = await plan([
      {
        type: 'step_duplicate',
        source: { id: 'b' },
        key: 'copy',
        placement: end
      }
    ])
    expect(Object.keys(result.duplicateIdMap).sort()).toEqual([
      'b',
      'bc',
      'button',
      'endicon',
      'icon'
    ])
    const copied = result.blockWrites.find(
      (write) => write.id === result.duplicateIdMap.button
    )!.create!
    expect(copied).toMatchObject({
      parentBlockId: result.duplicateIdMap.bc,
      startIconId: result.duplicateIdMap.icon,
      endIconId: result.duplicateIdMap.endicon,
      submitEnabled: false
    })
    expect(
      result.blockWrites.find((write) => write.id === result.idMap.copy)?.create
        ?.nextBlockId
    ).toBeNull()
  })

  it('matches mounted graph layout and resets only persisted social coordinates', async () => {
    const result = await plan([{ type: 'graph_auto_arrange' }])
    expect(result.journeyPatch).toEqual({ socialNodeX: -240, socialNodeY: -46 })
    expect(result.blockWrites.find((write) => write.id === 'a')?.patch).toEqual(
      {
        x: 0,
        y: -8
      }
    )
    expect(result.blockWrites.find((write) => write.id === 'b')?.patch).toEqual(
      {
        x: 600,
        y: -8
      }
    )
    expect(result.actionWrites).toEqual([])
    expect(
      result.blockWrites.every((write) =>
        Object.keys(write.patch).every(
          (field) => field === 'x' || field === 'y'
        )
      )
    ).toBe(true)
  })

  it('undoes a mixed typography color edit without replacing newer unrelated settings', async () => {
    const result = await plan([
      { type: 'typography_set', blockId: 'text', color: '#abcdef' },
      { type: 'step_position_set', step: { id: 'a' }, x: 3, y: 4 }
    ])
    const current = base().map((block) =>
      block.id === 'text'
        ? {
            ...block,
            settings: { color: '#abcdef', tracking: 'new human setting' }
          }
        : block.id === 'a'
          ? { ...block, x: 3, y: 4 }
          : block
    )
    readRows(current, [action('yes', 'b'), action('no', 'c')])
    const undo = await planStructureHistory(tx, journey, result.changes, 'undo')
    expect(
      undo.blockWrites.find((write) => write.id === 'text')?.patch.settings
    ).toEqual({ color: '#123456', tracking: 'new human setting' })
  })

  it('rejects undo after an affected action owner Card is moved to another Step', async () => {
    const result = await plan([
      {
        type: 'action_set',
        block: { id: 'yes' },
        action: { kind: 'step', destination: { id: 'c' } }
      }
    ])
    const current = base().map((block) =>
      block.id === 'ac' ? { ...block, parentBlockId: 'b' } : block
    )
    readRows(current, [action('yes', 'c'), action('no', 'c')])
    await expect(
      planStructureHistory(tx, journey, result.changes, 'undo')
    ).rejects.toThrow('HISTORY_CONFLICT')
  })

  it('refuses undo that would hide a new human route on created content', async () => {
    const result = await plan([
      {
        type: 'step_add',
        key: 'new',
        cardKey: 'card',
        placement: end,
        content: [{ key: 'button', content: { kind: 'button' } }]
      }
    ])
    const current = [
      ...base(),
      ...result.blockWrites
        .filter((write) => write.create)
        .map((write) => write.create!)
    ]
    readRows(current, [
      action('yes', 'b'),
      action('no', 'c'),
      action(result.idMap.button, 'a')
    ])
    await expect(
      planStructureHistory(tx, journey, result.changes, 'undo')
    ).rejects.toThrow('HISTORY_CONFLICT')
  })

  it('refuses deletion redo from legacy descriptors without an action snapshot', async () => {
    const saved = await plan([{ type: 'step_remove', step: { id: 'b' } }])
    for (const change of saved.changes[0].blocks) delete change.removalAction
    await expect(
      planStructureHistory(tx, journey, saved.changes, 'redo')
    ).rejects.toThrow('HISTORY_UNAVAILABLE')
  })

  it('rejects untrusted history descriptors instead of accepting hidden Host fields', async () => {
    const result = await plan([
      { type: 'step_position_set', step: { id: 'a' }, x: 3, y: 4 }
    ])
    const descriptor = { ...result.changes[0], hostId: 'foreign' }
    await expect(
      planStructureHistory(tx, journey, [descriptor], 'undo')
    ).rejects.toThrow('HISTORY_UNAVAILABLE')
  })
})
