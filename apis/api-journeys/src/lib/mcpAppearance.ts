import {
  type AppearanceCommand,
  appearanceJourneyFields
} from '@core/yoga/mcp/appearanceContract'

import {
  type BlockState,
  type StructureState,
  children,
  emptyBlock,
  idOf,
  live,
  requiredString,
  siblingsFrom
} from './mcpStructureState'

export type EditorFeature = 'websiteMode' | 'editJourneyTrackingMetrics'
export type FeatureCheck = (feature: EditorFeature) => Promise<boolean>
export async function requireEditorFeature(
  check: FeatureCheck,
  feature: EditorFeature
) {
  if (!(await check(feature))) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
}
export function appearancePlanner(
  state: StructureState,
  context: {
    allocate: (key: string) => string
    claim: (id: string, field: string) => void
    check: FeatureCheck
    resolve: (
      reference: { id: string } | { local: string },
      type?: string
    ) => BlockState
    stepFor: (row: BlockState) => BlockState
    removeMenu: (id: string) => void
  }
) {
  const features = new Set<EditorFeature>()
  const menus = new Map<string, BlockState>()
  const requireFeature = async (feature: EditorFeature) => {
    features.add(feature)
    await requireEditorFeature(context.check, feature)
  }
  const requireWebsite = async () => {
    await requireFeature('websiteMode')
    if (state.journey.website !== true) throw new Error('VALIDATION_FAILED')
  }
  const declareMenu = (key: string) => {
    const stepId = context.allocate(key)
    const create = (
      kind: string,
      parent: string | null,
      values: Partial<BlockState>,
      suffix?: string
    ) => {
      const id = suffix ? context.allocate(`${key}.${suffix}`) : stepId
      const row = {
        ...emptyBlock(state.journey.id, kind, id),
        parentBlockId: parent,
        ...values
      }
      state.blocks.set(id, row)
      state.created.add(id)
      return row
    }
    // Admin's menu gesture owns these seven blocks. Buttons start with no action or icons.
    const step = create('StepBlock', null, {
      parentOrder: null,
      x: 0,
      y: 144,
      locked: false,
      nextBlockId: null
    })
    const card = create(
      'CardBlock',
      stepId,
      {
        parentOrder: 0,
        themeMode: 'dark',
        themeName: 'base',
        fullscreen: false
      },
      'card'
    )
    create(
      'TypographyBlock',
      idOf(card),
      { parentOrder: 0, content: 'Menu', variant: 'h1', align: 'center' },
      'heading'
    )
    create(
      'TypographyBlock',
      idOf(card),
      {
        parentOrder: 1,
        content: 'Helping people discover Jesus.',
        variant: 'subtitle2',
        align: 'center'
      },
      'subheading'
    )
    for (const [index, label] of [
      'About Us',
      'Ministries',
      'Contact Us'
    ].entries())
      create(
        'ButtonBlock',
        idOf(card),
        {
          parentOrder: index + 2,
          label,
          variant: 'contained',
          size: 'large',
          submitEnabled: false
        },
        `button${index + 1}`
      )
    menus.set(key, step)
  }
  return {
    features,
    declareMenu,
    async apply(command: AppearanceCommand) {
      if (
        command.type === 'journey_details_set' ||
        command.type === 'journey_social_set' ||
        command.type === 'journey_appearance_set'
      ) {
        if (command.type === 'journey_appearance_set') {
          if (command.website !== undefined) await requireFeature('websiteMode')
          if (command.menuButtonIcon !== undefined) {
            await requireFeature('websiteMode')
            if ((command.website ?? state.journey.website) !== true)
              throw new Error('VALIDATION_FAILED')
          }
          if (
            (command.website ?? state.journey.website) === true &&
            ['showShareButton', 'showLikeButton', 'showDislikeButton'].some(
              (field) => field in command
            )
          )
            throw new Error('VALIDATION_FAILED')
        }
        for (const field of appearanceJourneyFields) {
          if (!(field in command)) continue
          context.claim(state.journey.id, field)
          state.journey[field] = (
            command as unknown as Record<string, string | boolean | null>
          )[field]
        }
        return
      }
      if (command.type === 'menu_create') {
        await requireWebsite()
        context.claim(state.journey.id, 'menuStepBlockId')
        if (state.journey.menuStepBlockId !== null)
          throw new Error('VALIDATION_FAILED')
        const step = menus.get(command.key)
        if (!step) throw new Error('VALIDATION_FAILED')
        const parentOrder =
          siblingsFrom(state.blocks, null).reduce(
            (maximum, id) =>
              Math.max(
                maximum,
                Number(state.blocks.get(id)?.parentOrder ?? -1)
              ),
            -1
          ) + 1
        if (parentOrder > 2147483647) throw new Error('VALIDATION_FAILED')
        step.parentOrder = parentOrder
        state.siblingParents.add(null)
        state.journey.menuStepBlockId = idOf(step)
        return
      }
      if (command.type === 'menu_remove') {
        await requireWebsite()
        context.claim(state.journey.id, 'menuStepBlockId')
        if (typeof state.journey.menuStepBlockId !== 'string')
          throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        context.removeMenu(state.journey.menuStepBlockId)
        return
      }
      if (command.type === 'tracking_set') {
        await requireFeature('editJourneyTrackingMetrics')
        const row = context.resolve(command.block)
        context.stepFor(row)
        if (
          ![
            'CardBlock',
            'ButtonBlock',
            'RadioOptionBlock',
            'VideoBlock'
          ].includes(requiredString(row.typename)) ||
          (command.endEventLabel !== undefined && row.typename !== 'VideoBlock')
        )
          throw new Error('VALIDATION_FAILED')
        if (row.typename === 'CardBlock') {
          if (
            children(state, idOf(context.stepFor(row))).filter(
              (child) => child.typename === 'CardBlock'
            ).length !== 1
          )
            throw new Error('VALIDATION_FAILED')
        } else if (row.parentOrder === null)
          throw new Error('VALIDATION_FAILED')
        else {
          const parent = context.resolve(
            { id: requiredString(row.parentBlockId) },
            row.typename === 'RadioOptionBlock'
              ? 'RadioQuestionBlock'
              : 'CardBlock'
          )
          if (row.typename === 'RadioOptionBlock')
            context.resolve(
              { id: requiredString(parent.parentBlockId) },
              'CardBlock'
            )
        }
        for (const field of ['eventLabel', 'endEventLabel'] as const) {
          if (command[field] === undefined) continue
          context.claim(idOf(row), field)
          row[field] = command[field]!
        }
      }
    }
  }
}

/** History re-evaluates current mounted eligibility for every affected field. */
export async function checkAppearanceHistory(
  state: StructureState,
  changes: {
    journey: Array<{ field: string }>
    blocks: Array<{ id: string; fields: string[] }>
  },
  check: FeatureCheck
): Promise<EditorFeature[]> {
  const features = new Set<EditorFeature>()
  const journeyFields = changes.journey.map((change) => change.field)
  if (
    journeyFields.some((field) =>
      ['website', 'menuButtonIcon', 'menuStepBlockId'].includes(field)
    ) ||
    changes.blocks.some((change) => change.fields.includes('slug'))
  )
    features.add('websiteMode')
  if (
    journeyFields.some((field) =>
      ['menuButtonIcon', 'menuStepBlockId'].includes(field)
    ) ||
    changes.blocks.some((change) => change.fields.includes('slug'))
  ) {
    // A mode transition restores its own settings, including values hidden in
    // the restored mode. Current values still have to match the recorded entry.
    if (state.journey.website !== true && !journeyFields.includes('website'))
      throw new Error('HISTORY_CONFLICT')
  }
  if (
    state.journey.website === true &&
    !journeyFields.includes('website') &&
    journeyFields.some((field) =>
      ['showShareButton', 'showLikeButton', 'showDislikeButton'].includes(field)
    )
  )
    throw new Error('HISTORY_CONFLICT')
  if (
    changes.blocks.some((change) =>
      change.fields.some((field) =>
        ['eventLabel', 'endEventLabel'].includes(field)
      )
    )
  )
    features.add('editJourneyTrackingMetrics')
  for (const feature of features) await requireEditorFeature(check, feature)
  // A reference cannot adopt a foreign, deleted or non-Step menu.
  if (
    journeyFields.includes('menuStepBlockId') &&
    state.journey.menuStepBlockId !== null
  ) {
    const menu = state.blocks.get(requiredString(state.journey.menuStepBlockId))
    if (
      !live(menu) ||
      menu.typename !== 'StepBlock' ||
      menu.parentBlockId !== null
    )
      throw new Error('HISTORY_CONFLICT')
  }
  return [...features]
}
