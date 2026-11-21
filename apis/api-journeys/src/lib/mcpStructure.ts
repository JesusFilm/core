import { randomUUID } from 'node:crypto'

import slugify from 'slugify'

import { Prisma } from '@core/prisma/journeys/client'
import { type EditInput, commandRegistry } from '@core/yoga/mcp/editContract'
import {
  mediaCommand,
  mediaCommandNames,
  mediaSourceKey
} from '@core/yoga/mcp/mediaContract'
import {
  type ActionValue,
  type BlockReference,
  type ContentCreate,
  type Placement,
  normalizeActionUrl
} from '@core/yoga/mcp/structureContract'

import { type MediaProjection, applyMedia } from './mcpMedia'
import {
  type BlockState,
  type StructurePlan,
  type StructureState,
  children,
  emptyAction,
  emptyBlock,
  finishStructure,
  idOf,
  live,
  loadStructure,
  parentOf,
  requiredString,
  serialize,
  siblingsFrom
} from './mcpStructureState'

export { executeStructure } from './mcpStructureState'
export type { StructureInverse, StructurePlan } from './mcpStructureState'

type Journey = {
  id: string
  website: boolean | null
  menuStepBlockId: string | null
  socialNodeX: number | null
  socialNodeY: number | null
  logoImageBlockId?: string | null
  primaryImageBlockId?: string | null
}
const contentTypes = new Set([
  'TypographyBlock',
  'ButtonBlock',
  'SpacerBlock',
  'ImageBlock',
  'VideoBlock',
  'RadioQuestionBlock',
  'MultiselectBlock',
  'TextResponseBlock',
  'SignUpBlock'
])
const actionTypes = new Set([
  'ButtonBlock',
  'RadioOptionBlock',
  'VideoBlock',
  'SignUpBlock',
  'VideoTriggerBlock'
])
const ownedReferences = [
  'coverBlockId',
  'posterBlockId',
  'pollOptionImageBlockId',
  'startIconId',
  'endIconId',
  'submitIconId'
] as const
function fail(): never {
  throw new Error('VALIDATION_FAILED')
}
function missing(): never {
  throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
}

/** Complete gestures are projected before acceptance. No provider or network
 * work occurs here. The caller owns the rights, generation and revision locks. */
export async function planStructure(
  tx: Prisma.TransactionClient,
  journey: Journey,
  commands: EditInput['commands'],
  media?: MediaProjection
) {
  const state = await loadStructure(tx, journey)
  const locals = new Map<string, string>()
  const duplicateIdMap: Record<string, string> = Object.create(null)
  const duplicateMaps: StructurePlan['duplicateMaps'] = Object.create(null)
  const explicitWrites = new Set<string>()
  const destroyed = new Set<string>()
  const afterAnchors = new Map<string, string>()
  const pendingPlacements = new Map<string, Placement>()
  const inserted = new Set<string>()
  const placing = new Set<string>()
  const assignedRoutes: Array<{
    ownerId: string
    destinationId: string
    action: boolean
  }> = []
  const now = new Date().toISOString()
  const allocate = (key: string): string => {
    if (locals.has(key)) fail()
    const id = randomUUID()
    locals.set(key, id)
    return id
  }
  const resolveId = (ref: BlockReference): string => {
    if ('id' in ref) return ref.id
    return locals.get(ref.local) ?? missing()
  }
  const get = (id: string, type?: string): BlockState => {
    const row = state.blocks.get(id)
    if (!live(row) || (type && row.typename !== type)) missing()
    return row
  }
  const resolve = (ref: BlockReference, type?: string) =>
    get(resolveId(ref), type)
  const claim = (id: string, field: string) => {
    if (destroyed.has(id)) fail()
    const key = `${id}\0${field}`
    if (explicitWrites.has(key)) fail()
    explicitWrites.add(key)
  }
  const create = (
    typename: string,
    id: string,
    parentId: string | null
  ): BlockState => {
    const row = emptyBlock(journey.id, typename, id)
    row.parentBlockId = parentId
    state.blocks.set(id, row)
    state.created.add(id)
    if (state.created.size > 200) throw new Error('LIMIT_EXCEEDED')
    return row
  }
  const stepFor = (row: BlockState): BlockState => {
    let current = row
    const visited = new Set<string>()
    while (current.typename !== 'StepBlock') {
      const id = idOf(current)
      if (visited.has(id) || !parentOf(current)) fail()
      visited.add(id)
      current = get(
        parentOf(current)!,
        current.typename === 'CardBlock' ? 'StepBlock' : undefined
      )
    }
    if (current.parentBlockId !== null) fail()
    const cards = children(state, idOf(current)).filter(
      (child) => child.typename === 'CardBlock'
    )
    if (cards.length !== 1) fail()
    return current
  }
  const cardFor = (row: BlockState): BlockState => {
    const card = get(parentOf(row) ?? missing(), 'CardBlock')
    stepFor(card)
    return card
  }
  const eligibleContent = (row: BlockState, duplicate = false): void => {
    if (row.parentOrder === null) fail()
    if (contentTypes.has(requiredString(row.typename))) cardFor(row)
    else if (row.typename === 'RadioOptionBlock') {
      const parent = get(parentOf(row) ?? missing(), 'RadioQuestionBlock')
      cardFor(parent)
    } else if (row.typename === 'MultiselectOptionBlock') {
      const parent = get(parentOf(row) ?? missing(), 'MultiselectBlock')
      cardFor(parent)
    } else fail()
    if (duplicate && row.typename === 'VideoBlock') fail()
  }
  const subtree = (root: BlockState): BlockState[] => {
    const result: BlockState[] = [],
      seen = new Set<string>(),
      queue = [root]
    while (queue.length) {
      const row = queue.shift()!,
        id = idOf(row)
      if (seen.has(id)) fail()
      seen.add(id)
      result.push(row)
      if (result.length > 200) throw new Error('LIMIT_EXCEEDED')
      queue.push(...children(state, id))
    }
    return result
  }
  const insert = (row: BlockState, placement: Placement): void => {
    const rowId = idOf(row)
    if (inserted.has(rowId)) return
    if (placing.has(rowId)) fail()
    placing.add(rowId)
    if (placement.position !== 'end') {
      const anchor = resolve(placement.anchor)
      const anchorPlacement = pendingPlacements.get(idOf(anchor))
      if (anchor.parentOrder === null && anchorPlacement)
        insert(anchor, anchorPlacement)
    }
    const parent = parentOf(row)
    const ids = siblingsFrom(state.blocks, parent).filter((id) => id !== row.id)
    let index = ids.length
    if (placement.position !== 'end') {
      const anchor = resolve(placement.anchor)
      if (
        parentOf(anchor) !== parent ||
        anchor.parentOrder === null ||
        anchor.id === row.id
      )
        fail()
      if (parent === null && anchor.typename !== 'StepBlock') fail()
      let anchorId = idOf(anchor)
      if (placement.position === 'after') {
        const key = `${parent}\0${anchorId}`
        anchorId = afterAnchors.get(key) ?? anchorId
        afterAnchors.set(key, idOf(row))
      }
      index = ids.indexOf(anchorId)
      if (index < 0) fail()
      if (placement.position === 'after') index++
    }
    ids.splice(index, 0, idOf(row))
    state.siblingParents.add(parent)
    ids.forEach((id, index) => {
      get(id).parentOrder = index
    })
    inserted.add(rowId)
    placing.delete(rowId)
  }
  const addContent = (
    id: string,
    cardId: string,
    content: ContentCreate
  ): BlockState => {
    const card = get(cardId, 'CardBlock')
    stepFor(card)
    const typename = {
      typography: 'TypographyBlock',
      button: 'ButtonBlock',
      spacer: 'SpacerBlock',
      image: 'ImageBlock',
      video: 'VideoBlock'
    }[content.kind]
    const row = create(typename, id, cardId)
    if (content.kind === 'typography') {
      row.content = content.content ?? ''
      row.variant =
        content.variant ??
        (children(state, cardId).some(
          (child) => child.typename === 'TypographyBlock' && child.id !== id
        )
          ? 'body2'
          : 'h1')
      row.align = content.align ?? null
      if (content.color) row.settings = { color: content.color }
    } else if (content.kind === 'button') {
      row.label = content.label ?? ''
      row.variant = content.variant ?? 'contained'
      row.color = content.color ?? 'primary'
      row.size = content.size ?? 'medium'
      row.settings = { alignment: content.align ?? 'justify' }
      const siblings = children(state, cardId)
      row.submitEnabled =
        siblings.some((child) => child.typename === 'TextResponseBlock') &&
        !siblings.some(
          (child) =>
            child.typename === 'ButtonBlock' &&
            child.id !== id &&
            child.submitEnabled === true
        )
      for (const slot of ['startIconId', 'endIconId'] as const) {
        const icon = create('IconBlock', randomUUID(), id)
        row[slot] = icon.id
      }
    } else if (content.kind === 'spacer') row.spacing = content.spacing ?? 100
    else if (content.kind === 'image') row.alt = ''
    else if (content.kind === 'video') {
      row.source = 'internal'
      row.autoplay = true
      row.muted = false
      row.fullsize = true
    }
    if (content.kind === 'video' && card.fullscreen === false) fail()
    return row
  }
  // Allocate the complete local namespace before resolving any reference.
  for (const command of commands) {
    if (command.type === 'step_add') {
      allocate(command.key)
      allocate(command.cardKey)
      for (const child of command.content ?? []) allocate(child.key)
    } else if (
      ['block_add', 'step_duplicate', 'block_duplicate'].includes(command.type)
    )
      allocate(
        (command as Extract<EditInput['commands'][number], { key: string }>).key
      )
  }
  const newSteps = commands.filter(
    (command) =>
      command.type === 'step_add' || command.type === 'step_duplicate'
  ).length
  for (const command of commands) {
    if ('key' in command && 'placement' in command)
      pendingPlacements.set(locals.get(command.key)!, command.placement)
  }
  if (newSteps > 20) throw new Error('LIMIT_EXCEEDED')
  // Materialize required descendants before route resolution, including forward locals.
  for (const command of commands) {
    if (command.type !== 'step_add') continue
    const step = create('StepBlock', locals.get(command.key)!, null)
    step.x = command.x ?? null
    step.y = command.y ?? null
    const card = create('CardBlock', locals.get(command.cardKey)!, idOf(step))
    card.parentOrder = 0
    card.fullscreen = true
    Object.assign(card, command.card ?? {})
    if (card.themeMode !== null && card.themeName === null)
      card.themeName = 'base'
    for (const [index, child] of (command.content ?? []).entries()) {
      addContent(
        locals.get(child.key)!,
        idOf(card),
        child.content
      ).parentOrder = index
    }
  }
  for (const command of commands) {
    if (command.type !== 'block_add') continue
    addContent(
      locals.get(command.key)!,
      idOf(resolve(command.card, 'CardBlock')),
      command.content
    )
  }
  const duplicateCommands = commands.filter(
    (command) =>
      command.type === 'step_duplicate' || command.type === 'block_duplicate'
  )
  for (let remaining = [...duplicateCommands]; remaining.length; ) {
    let progress = false
    const next: typeof remaining = []
    for (const command of remaining) {
      const sourceId = resolveId(command.source),
        source = state.blocks.get(sourceId)
      if (!live(source)) {
        next.push(command)
        continue
      }
      if (command.type === 'step_duplicate') {
        if (source.typename !== 'StepBlock' || source.parentBlockId !== null)
          fail()
        stepFor(source)
      } else eligibleContent(source, true)
      const originals = subtree(source),
        mapping = new Map<string, string>()
      originals.forEach((row) =>
        mapping.set(
          idOf(row),
          row.id === source.id ? locals.get(command.key)! : randomUUID()
        )
      )
      duplicateMaps[command.key] = [...mapping].map(([sourceId, blockId]) => ({
        sourceId,
        blockId
      }))
      for (const original of originals) {
        const id = mapping.get(idOf(original))!,
          row = serialize(original)
        if (media && original.typename === 'ImageBlock' && original.src) {
          const source = media.sources.get(
            mediaSourceKey({ source: 'history', blockId: idOf(original) })
          )
          if (!source || source.kind !== 'image') missing()
          Object.assign(row, {
            src: source.src,
            width: source.width,
            height: source.height,
            blurhash: source.blurhash
          })
        }
        row.id = id
        row.slug = null
        row.deletedAt = null
        row.customizable = false
        row.parentBlockId =
          original.id === source.id
            ? parentOf(source)
            : (mapping.get(parentOf(original)!) ?? fail())
        if (row.typename === 'StepBlock') {
          row.nextBlockId = null
          const x = typeof row.x === 'number' ? row.x + 225 : null
          if (x !== null && (x > 2147483647 || x < -2147483648)) fail()
          row.x = x
        }
        for (const slot of ownedReferences) {
          const ref = original[slot]
          if (ref === null) continue
          if (typeof ref !== 'string' || !mapping.has(ref)) fail()
          const child = state.blocks.get(ref)
          if (!live(child) || child.parentBlockId !== original.id) fail()
          const allowedType = slot.includes('IconId')
            ? ['IconBlock']
            : slot === 'coverBlockId'
              ? ['ImageBlock', 'VideoBlock']
              : ['ImageBlock']
          if (!allowedType.includes(requiredString(child.typename))) fail()
          row[slot] = mapping.get(ref)!
        }
        if (
          command.type === 'block_duplicate' &&
          row.typename === 'ButtonBlock' &&
          row.submitEnabled === true
        )
          row.submitEnabled = false
        if (original.id === source.id) row.parentOrder = null
        state.blocks.set(id, row)
        state.created.add(id)
        duplicateIdMap[idOf(original)] = id
        const action = state.actions.get(idOf(original))
        if (action) {
          const copied = serialize(action)
          copied.parentBlockId = id
          copied.customizable = false
          const ownerStep = stepFor(original)
          copied.parentStepId = mapping.get(idOf(ownerStep)) ?? idOf(ownerStep)
          if (typeof copied.blockId === 'string') {
            // Keep source-specific action destinations, even when pointing into
            // the copied Step. Only owned containment references are remapped.
            stepFor(get(copied.blockId, 'StepBlock'))
            assignedRoutes.push({
              ownerId: id,
              destinationId: copied.blockId,
              action: true
            })
          }
          if (copied.journeyId !== null && copied.journeyId !== journey.id)
            fail()
          state.actions.set(id, copied)
        }
      }
      progress = true
    }
    if (!progress) missing()
    remaining = next
  }
  const setAction = (row: BlockState, action: ActionValue): void => {
    if (!actionTypes.has(requiredString(row.typename))) fail()
    if (
      row.typename === 'ButtonBlock' ||
      row.typename === 'VideoBlock' ||
      row.typename === 'SignUpBlock'
    )
      cardFor(row)
    else if (row.typename === 'RadioOptionBlock')
      cardFor(get(parentOf(row) ?? missing(), 'RadioQuestionBlock'))
    else cardFor(get(parentOf(row) ?? missing(), 'VideoBlock'))
    if (row.parentOrder === null && row.typename !== 'VideoTriggerBlock') fail()
    const step = stepFor(row),
      id = idOf(row)
    if (
      row.typename === 'ButtonBlock' &&
      row.submitEnabled === true &&
      !['none', 'step'].includes(action.kind)
    )
      fail()
    claim(id, 'action')
    if (action.kind === 'none') {
      state.actions.delete(id)
      return
    }
    const prior = state.actions.get(id),
      next = emptyAction(id)
    next.gtmEventName = prior?.gtmEventName ?? null
    next.customizable = prior?.customizable ?? null
    next.parentStepId = step.id
    if (action.kind === 'step') {
      const destination = resolve(action.destination, 'StepBlock')
      stepFor(destination)
      next.blockId = destination.id
      assignedRoutes.push({
        ownerId: id,
        destinationId: requiredString(next.blockId),
        action: true
      })
    } else if (action.kind === 'link') next.url = normalizeActionUrl(action.url)
    else if (action.kind === 'email') next.email = action.email
    else if (action.kind === 'chat')
      next.chatUrl = normalizeActionUrl(action.chatUrl)
    else {
      next.phone = action.phone
      next.countryCode = action.countryCode
      next.contactAction = action.kind === 'sms' ? 'text' : 'call'
    }
    state.actions.set(id, next)
  }
  for (const command of commands) {
    if ((mediaCommandNames as readonly string[]).includes(command.type)) {
      applyMedia(mediaCommand.parse(command), {
        state,
        resolve,
        claim,
        now,
        media
      })
      continue
    }
    if (
      command.type === 'step_add' ||
      command.type === 'block_add' ||
      command.type === 'step_duplicate' ||
      command.type === 'block_duplicate'
    ) {
      insert(get(locals.get(command.key)!), command.placement)
      continue
    }
    if (command.type === 'step_remove' || command.type === 'block_remove') {
      const row =
        command.type === 'step_remove'
          ? resolve(command.step, 'StepBlock')
          : resolve(command.block)
      if (command.type === 'step_remove') stepFor(row)
      else eligibleContent(row)
      const removed = subtree(row)
      for (const child of removed) {
        const id = idOf(child)
        if (
          destroyed.has(id) ||
          state.created.has(id) ||
          [...explicitWrites].some((key) => key.startsWith(`${id}\0`))
        )
          fail()
        destroyed.add(id)
        child.deletedAt = now
      }
      const parent = parentOf(row)
      state.siblingParents.add(parent)
      // Step order is the sorted sibling order, so gaps are valid. Retaining
      // those values also preserves every surviving incoming route row,
      // including a later sibling whose continuation points at this Step.
      if (command.type === 'block_remove')
        siblingsFrom(state.blocks, parent).forEach((id, index) => {
          get(id).parentOrder = index
        })
      if (command.type === 'step_remove') {
        if (state.journey.menuStepBlockId === row.id)
          state.journey.menuStepBlockId = null
      }
      if (row.typename === 'MultiselectOptionBlock') {
        const owner = get(parent ?? missing(), 'MultiselectBlock'),
          count = children(state, idOf(owner)).length
        if (typeof owner.max === 'number')
          owner.max = Math.min(Math.max(owner.max, 0), count)
        if (typeof owner.min === 'number')
          owner.min = Math.min(
            Math.max(owner.min, 0),
            count,
            typeof owner.max === 'number' ? owner.max : count
          )
      }
      continue
    }
    if (
      command.type === 'steps_reorder' ||
      command.type === 'content_reorder'
    ) {
      const parent =
        command.type === 'steps_reorder'
          ? null
          : idOf(resolve(command.card, 'CardBlock'))
      if (parent) stepFor(get(parent))
      const ids = (
        command.type === 'steps_reorder' ? command.steps : command.blocks
      ).map(resolveId)
      const current = siblingsFrom(state.blocks, parent)
      if (
        ids.length !== current.length ||
        new Set(ids).size !== ids.length ||
        ids.some((id) => !current.includes(id))
      )
        fail()
      state.siblingParents.add(parent)
      ids.forEach((id, index) => {
        claim(id, 'parentOrder')
        get(id).parentOrder = index
      })
      continue
    }
    if (command.type === 'step_default_set') {
      const step = resolve(command.step, 'StepBlock')
      stepFor(step)
      claim(idOf(step), 'nextBlockId')
      const destination =
        command.destination === null
          ? null
          : resolve(command.destination, 'StepBlock')
      if (destination) {
        stepFor(destination)
        if (idOf(step) === idOf(destination)) fail()
      }
      step.nextBlockId = destination?.id ?? null
      if (destination)
        assignedRoutes.push({
          ownerId: idOf(step),
          destinationId: idOf(destination),
          action: false
        })
    } else if (command.type === 'action_set')
      setAction(resolve(command.block), command.action)
    else if (command.type === 'step_position_set') {
      const row = resolve(command.step, 'StepBlock')
      stepFor(row)
      claim(idOf(row), 'x')
      claim(idOf(row), 'y')
      row.x = command.x
      row.y = command.y
    } else if (command.type === 'social_position_set') {
      claim(journey.id, 'socialNodeX')
      claim(journey.id, 'socialNodeY')
      state.journey.socialNodeX = command.x
      state.journey.socialNodeY = command.y
    } else if (command.type === 'graph_auto_arrange') {
      const positions = arrangeStructure(state)
      for (const [id, position] of positions) {
        claim(id, 'x')
        claim(id, 'y')
        Object.assign(get(id), position)
      }
      claim(journey.id, 'socialNodeX')
      claim(journey.id, 'socialNodeY')
      state.journey.socialNodeX = -240
      state.journey.socialNodeY = -46
    } else if (command.type === 'card_slug_set') {
      if (journey.website !== true) fail()
      const row = resolve(command.step, 'StepBlock')
      stepFor(row)
      claim(idOf(row), 'slug')
      row.slug =
        command.slug === null
          ? null
          : slugify(command.slug, { lower: true, strict: true }) || null
    } else if (command.type === 'typography_set') {
      const row = get(command.blockId, 'TypographyBlock')
      cardFor(row)
      for (const field of ['content', 'variant', 'align', 'color'] as const)
        if (command[field] !== undefined) claim(idOf(row), field)
      const result = commandRegistry.typography_set.apply(
        {
          content: row.content as string | null,
          variant: row.variant as string | null,
          align: row.align as string | null,
          settings: row.settings
        },
        command
      )
      Object.assign(row, result.patch)
    }
  }
  // Recheck assigned routes against final projected state. Legacy unresolved
  // references elsewhere remain untouched and do not prevent unrelated edits.
  for (const route of assignedRoutes) {
    const owner = get(route.ownerId)
    const destination = route.action
      ? state.actions.get(route.ownerId)?.blockId
      : owner.nextBlockId
    if (destination !== null && destination !== undefined)
      stepFor(get(requiredString(destination), 'StepBlock'))
  }
  const slugs = new Set<string>()
  for (const row of state.blocks.values()) {
    if (!live(row) || typeof row.slug !== 'string') continue
    if (slugs.has(row.slug)) fail()
    slugs.add(row.slug)
  }
  // Database uniqueness includes soft-deleted slugs too.
  const changedSlugs = [...state.blocks.values()].filter(
    (row) =>
      row.slug !== null &&
      row.slug !== state.originalBlocks.get(idOf(row))?.slug
  )
  for (const row of changedSlugs)
    if (
      await tx.block.findFirst({
        where: {
          journeyId: journey.id,
          slug: requiredString(row.slug),
          id: { not: idOf(row) }
        }
      })
    )
      fail()
  const plan = finishStructure(state, now)
  if (
    media &&
    plan.blockWrites.some(
      (write) => write.create && (write.create.src || write.create.videoId)
    )
  )
    for (const inverse of plan.changes) inverse.media = true
  if (
    commands.some((command) =>
      (mediaCommandNames as readonly string[]).includes(command.type)
    )
  )
    for (const inverse of plan.changes) inverse.media = true
  plan.idMap = Object.fromEntries(locals)
  plan.duplicateIdMap = duplicateIdMap
  plan.duplicateMaps = duplicateMaps
  return plan
}

/** Equivalent to the Admin arrangement algorithm, using owning scalar data.
 * Default fallthrough and mounted action row counts determine graph columns. */
export function arrangeStructure(
  state: StructureState
): Map<string, { x: number; y: number }> {
  const steps = siblingsFrom(state.blocks, null),
    unvisited = new Set(steps),
    columns: string[][] = []
  const actionRows = (stepId: string): BlockState[] => {
    const card = children(state, stepId).find(
      (row) => row.typename === 'CardBlock'
    )
    if (!card) return []
    return children(state, idOf(card))
      .flatMap((row) =>
        row.typename === 'RadioQuestionBlock'
          ? children(state, idOf(row))
          : [row]
      )
      .filter(
        (row) =>
          row.id !== card.coverBlockId &&
          [
            'ButtonBlock',
            'RadioOptionBlock',
            'VideoBlock',
            'SignUpBlock'
          ].includes(requiredString(row.typename))
      )
  }
  const visit = (id: string | null): string | undefined => {
    if (id === null || !unvisited.has(id)) return
    unvisited.delete(id)
    return id
  }
  while (unvisited.size) {
    let level = [visit([...unvisited][0])!]
    while (level.length) {
      columns.push(level)
      const next: string[] = []
      for (const id of level) {
        const row = state.blocks.get(id)!,
          index = steps.indexOf(id)
        const destination =
          typeof row.nextBlockId === 'string'
            ? row.nextBlockId
            : (steps[index + 1] ?? null)
        const continuation = destination !== id ? visit(destination) : undefined
        if (continuation) next.push(continuation)
        for (const owner of actionRows(id)) {
          const target = state.actions.get(idOf(owner))?.blockId
          const child = typeof target === 'string' ? visit(target) : undefined
          if (child) next.push(child)
        }
      }
      level = next
    }
  }
  const hasActions = columns.flat().some((id) => actionRows(id).length > 0),
    positions = new Map<string, { x: number; y: number }>()
  let previousActions = false
  columns.forEach((column, index) => {
    const gap = hasActions ? (previousActions ? 200 : 100) : 0,
      x = index * (200 + 200 + gap)
    let previous: string | undefined
    for (const id of column) {
      const y = previous
        ? positions.get(previous)!.y +
          (actionRows(previous).length + 1) * 27 +
          76 +
          50
        : -8
      positions.set(id, { x, y })
      previous = id
    }
    previousActions = actionRows(column[column.length - 1]).length > 0
  })
  return positions
}
