import { randomUUID } from 'node:crypto'

import { Prisma } from '@core/prisma/journeys/client'
import {
  type TypographyCommand,
  type TypographyInverse,
  commandRegistry
} from '@core/yoga/mcp/editContract'
import {
  type CreatedInverse,
  type PresentationCommand,
  type PresentationField,
  type PresentationInverse,
  deriveSubmitRole,
  presentationPatch
} from '@core/yoga/mcp/presentationContract'

export type ContentBlock = Pick<
  Prisma.BlockGetPayload<Record<string, never>>,
  'id' | 'typename' | 'journeyId' | 'parentBlockId' | 'parentOrder' | 'settings'
> &
  Partial<Prisma.BlockGetPayload<Record<string, never>>>
export type ContentInverse =
  | TypographyInverse
  | PresentationInverse
  | CreatedInverse
export interface ContentPlan {
  blockId: string
  patch?: Prisma.BlockUncheckedUpdateInput
  create?: Prisma.BlockUncheckedCreateInput
  inverse?: ContentInverse
  captureCreated?: { parent: { cardId: string; stepId: string }; ids: string[] }
  fields: Array<PresentationField | 'created' | 'deleted'>
  gate?: 'aiChatEditor'
}

/** Forward edits and history must reject aliases introduced by later work. */
export async function assertOwnedButtonIcon(
  tx: Prisma.TransactionClient,
  owner: ContentBlock,
  icon: ContentBlock,
  projected: ReadonlyMap<string, ContentBlock>
) {
  if (
    owner.typename !== 'ButtonBlock' ||
    owner.deletedAt ||
    icon.typename !== 'IconBlock' ||
    icon.parentBlockId !== owner.id ||
    owner.startIconId === owner.endIconId
  )
    throw new Error('HISTORY_CONFLICT')
  await assertOwnedIcon(tx, owner, icon, projected)
}

export async function assertOwnedIcon(
  tx: Prisma.TransactionClient,
  owner: ContentBlock,
  icon: ContentBlock,
  projected: ReadonlyMap<string, ContentBlock>
) {
  if (
    owner.deletedAt ||
    icon.deletedAt ||
    icon.typename !== 'IconBlock' ||
    icon.parentBlockId !== owner.id ||
    [owner.startIconId, owner.endIconId, owner.submitIconId].filter(id => id === icon.id).length !== 1
  )
    throw new Error('HISTORY_CONFLICT')
  const references = new Map(
    (
      await tx.block.findMany({
        where: {
          deletedAt: null,
          OR: [
            { startIconId: icon.id },
            { endIconId: icon.id },
            { submitIconId: icon.id }
          ]
        }
      })
    ).map((block) => [block.id, block as ContentBlock])
  )
  for (const [id, block] of projected) references.set(id, block)
  if (
    [...references.values()].some(
      (block) =>
        block.id !== owner.id &&
        !block.deletedAt &&
        [block.startIconId, block.endIconId, block.submitIconId].includes(
          icon.id
        )
    )
  )
    throw new Error('HISTORY_CONFLICT')
}

export async function contentSiblings(
  tx: Prisma.TransactionClient,
  journeyId: string,
  cardId: string,
  projected: ReadonlyMap<string, ContentBlock>
) {
  const siblings = new Map(
    (
      await tx.block.findMany({
        where: { journeyId, parentBlockId: cardId, deletedAt: null }
      })
    ).map((block) => [block.id, block as ContentBlock])
  )
  for (const [id, block] of projected)
    if (block.parentBlockId === cardId) siblings.set(id, block)
  return [...siblings.values()].filter((block) => !block.deletedAt)
}

/** Resolve the real containment chain, including owned Button icons and Cards. */
export async function contentParents(
  tx: Prisma.TransactionClient,
  journeyId: string,
  block: ContentBlock
): Promise<{ cardId: string; stepId: string }> {
  let card: ContentBlock | null = block.typename === 'CardBlock' ? block : null
  if (!card && block.parentBlockId) {
    const parent = await tx.block.findUnique({
      where: { id: block.parentBlockId, journeyId, deletedAt: null }
    })
    card = parent?.typename === 'CardBlock' ? parent : null
  }
  const step = card?.parentBlockId
    ? await tx.block.findUnique({
        where: { id: card.parentBlockId, journeyId, deletedAt: null }
      })
    : null
  if (
    card?.typename !== 'CardBlock' ||
    step?.typename !== 'StepBlock' ||
    step.parentBlockId !== null ||
    (await tx.block.count({
      where: {
        journeyId,
        parentBlockId: step.id,
        typename: 'CardBlock',
        deletedAt: null
      }
    })) !== 1
  )
    throw new Error('HISTORY_CONFLICT')
  return { cardId: card.id, stepId: step.id }
}

/** Each plan is checked before final acceptance; all writes use the owning tx. */
export async function planContent(
  tx: Prisma.TransactionClient,
  journeyId: string,
  commands: Array<PresentationCommand | TypographyCommand>,
  canEditChat: () => Promise<boolean>
) {
  const plans: ContentPlan[] = []
  const projected = new Map<string, ContentBlock>()
  const requestedWrites = new Map<string, Set<PresentationField>>()
  // Track requested fields before no-op filtering. Internal defaults and sibling
  // shifts are derived writes; separate explicit commands cannot overwrite one
  // another through a no-op, local key or owned Icon slot.
  const claimFields = (blockId: string, typename: string, value: object) => {
    const paths: Record<string, PresentationField | PresentationField[]> = {
      content: 'content',
      variant: 'variant',
      align: 'align',
      color: typename === 'TypographyBlock' ? 'settings.color' : 'color',
      label: 'label',
      size: 'size',
      alignment: 'settings.alignment',
      name: 'name',
      spacing: 'spacing',
      fullscreen: 'fullscreen',
      backgroundColor: 'backgroundColor',
      backdropBlur: 'backdropBlur',
      themeMode: ['themeMode', 'themeName'],
      enabled: 'showAssistant',
      collapse: 'expandChatByDefault'
    }
    const claimed = requestedWrites.get(blockId) ?? new Set<PresentationField>()
    for (const [field, supplied] of Object.entries(value)) {
      const mapped = paths[field]
      if (supplied === undefined || mapped === undefined) continue
      for (const path of Array.isArray(mapped) ? mapped : [mapped]) {
        if (claimed.has(path)) throw new Error('VALIDATION_FAILED')
        claimed.add(path)
      }
    }
    requestedWrites.set(blockId, claimed)
  }
  const idMap: Record<string, string> = Object.create(null)
  const placementTails = new Map<string, string>()
  const resolve = (id: string) =>
    id.startsWith('$') ? (idMap[id.slice(1)] ?? id) : id
  const get = async (reference: string) => {
    const id = resolve(reference)
    return (
      projected.get(id) ??
      (await tx.block.findUnique({
        where: { id, journeyId, deletedAt: null }
      }))
    )
  }
  const project = (block: ContentBlock, patch: Record<string, unknown>) => {
    projected.set(block.id, { ...block, ...patch })
  }
  const addPatch = (
    block: ContentBlock,
    patch: Record<string, unknown>,
    inverse: ContentInverse
  ) => {
    const fields =
      'fields' in inverse ? inverse.fields.map(({ field }) => field) : []
    if (!fields.length) return
    plans.push({
      blockId: block.id,
      patch: patch,
      inverse,
      fields,
      ...('gate' in inverse ? { gate: inverse.gate } : {})
    })
    project(block, patch)
  }
  for (const command of commands) {
    const targetId =
      command.type === 'block_add' ? command.cardId : command.blockId
    const block = await get(targetId)
    const expectedType =
      command.type === 'typography_set'
        ? 'TypographyBlock'
        : commandRegistry[command.type].typename
    if (!block || block.typename !== expectedType)
      throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
    const parent = await contentParents(tx, journeyId, block)
    if (command.type === 'block_add') {
      if (idMap[command.key]) throw new Error('VALIDATION_FAILED')
      const siblings = await contentSiblings(tx, journeyId, block.id, projected)
      const ordered = siblings
        .filter((item) => item.parentOrder !== null)
        .sort((a, b) => a.parentOrder! - b.parentOrder!)
      const placement = command.placement
      const anchorId =
        placement.position === 'end' ? undefined : resolve(placement.blockId)
      const actualAnchorId =
        placement.position === 'after'
          ? (placementTails.get(anchorId!) ?? anchorId)
          : anchorId
      const anchor =
        placement.position === 'end'
          ? undefined
          : ordered.find((item) => item.id === actualAnchorId)
      if (command.placement.position !== 'end' && !anchor)
        throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const index = anchor
        ? ordered.indexOf(anchor) +
          (command.placement.position === 'after' ? 1 : 0)
        : ordered.length
      for (const [position, sibling] of ordered.entries()) {
        const after = position >= index ? position + 1 : position
        if (sibling.parentOrder === after) continue
        addPatch(
          sibling,
          { parentOrder: after },
          {
            type: 'presentation_restore',
            blockId: sibling.id,
            typename: sibling.typename,
            parent,
            fields: [
              {
                field: 'parentOrder',
                before: sibling.parentOrder,
                after,
                beforePresent: true
              }
            ]
          }
        )
      }
      const id = randomUUID()
      idMap[command.key] = id
      if (placement.position === 'after') placementTails.set(anchorId!, id)
      const data: Prisma.BlockUncheckedCreateInput = {
        id,
        journeyId,
        parentBlockId: block.id,
        parentOrder: index,
        typename:
          command.block.kind === 'button'
            ? 'ButtonBlock'
            : command.block.kind === 'spacer'
              ? 'SpacerBlock'
              : 'TypographyBlock'
      }
      const value = command.block
      claimFields(id, data.typename, value)
      const icons: Prisma.BlockUncheckedCreateInput[] = []
      if (value.kind === 'typography') {
        data.content = value.content
        data.variant =
          value.variant ??
          (ordered.some((item) => item.typename === 'TypographyBlock')
            ? 'body2'
            : 'h1')
        data.align = value.align ?? null
        data.settings = value.color ? { color: value.color } : {}
      } else if (value.kind === 'spacer') data.spacing = value.spacing ?? 100
      else {
        data.label = value.label
        data.variant = value.variant ?? 'contained'
        data.color = value.color ?? 'primary'
        data.size = value.size ?? 'medium'
        data.settings = { alignment: value.alignment ?? 'justify' }
        data.submitEnabled = deriveSubmitRole('create', siblings)
        for (const slot of ['start', 'end'] as const) {
          const iconId = randomUUID()
          const icon = value[`${slot}Icon`]
          if (icon) claimFields(iconId, 'IconBlock', icon)
          data[`${slot}IconId`] = iconId
          idMap[`${command.key}.${slot}Icon`] = iconId
          icons.push({
            id: iconId,
            journeyId,
            parentBlockId: id,
            typename: 'IconBlock',
            name: icon?.name ?? null,
            color: icon?.color ?? null,
            parentOrder: null
          })
        }
      }
      for (const created of [data, ...icons]) {
        plans.push({
          blockId: created.id!,
          create: created,
          fields: ['created']
        })
        project(
          {
            id: created.id!,
            typename: created.typename,
            journeyId,
            parentBlockId: created.parentBlockId ?? null,
            parentOrder: created.parentOrder ?? null,
            content: null,
            variant: null,
            align: null,
            label: null,
            color: null,
            size: null,
            spacing: null,
            name: null,
            startIconId: null,
            endIconId: null,
            settings: {}
          },
          created
        )
      }
      plans[plans.length - 1].captureCreated = {
        parent,
        ids: [id, ...icons.map((icon) => icon.id!)]
      }
      continue
    }
    if (command.type !== 'button_icon_set')
      claimFields(block.id, block.typename, command)
    if (command.type === 'typography_set') {
      const applied = commandRegistry.typography_set.apply(
        {
          content: block.content ?? null,
          variant: block.variant ?? null,
          align: block.align ?? null,
          settings: block.settings
        },
        { ...command, blockId: block.id }
      )
      addPatch(block, { ...applied.patch }, { ...applied.inverse, parent })
      continue
    }
    if (command.type === 'card_chat_set' && !(await canEditChat()))
      throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
    if (command.type === 'card_set')
      await checkCardLayout(tx, journeyId, block.id, command.fullscreen)
    if (command.type === 'button_icon_set') {
      const slot = command.slot === 'start' ? 'startIconId' : 'endIconId'
      const otherSlot = slot === 'startIconId' ? 'endIconId' : 'startIconId'
      const iconId = block[slot]
      if (iconId && iconId === block[otherSlot])
        throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      const icon = iconId ? await get(iconId) : null
      if (
        iconId &&
        (!icon ||
          icon.typename !== 'IconBlock' ||
          icon.parentBlockId !== block.id)
      )
        throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
      if (icon) await assertOwnedButtonIcon(tx, block, icon, projected)
      if (!icon) {
        const createdId = randomUUID()
        claimFields(createdId, 'IconBlock', command)
        const data: Prisma.BlockUncheckedCreateInput = {
          id: createdId,
          typename: 'IconBlock',
          journeyId,
          parentBlockId: block.id,
          parentOrder: null,
          name: command.name ?? null,
          color: command.color ?? null
        }
        plans.push({
          blockId: createdId,
          create: data,
          fields: ['created'],
          captureCreated: { parent, ids: [createdId] }
        })
        project(
          {
            id: createdId,
            typename: 'IconBlock',
            journeyId,
            parentBlockId: block.id,
            parentOrder: null,
            settings: {},
            name: null,
            color: null,
            size: null
          },
          data
        )
        addPatch(
          block,
          { [slot]: createdId },
          {
            type: 'presentation_restore',
            blockId: block.id,
            typename: block.typename,
            parent,
            fields: [
              {
                field: slot,
                before: null,
                after: createdId,
                beforePresent: true
              }
            ]
          }
        )
      } else {
        claimFields(icon.id, 'IconBlock', command)
        const applied = presentationPatch(icon, command)
        addPatch(icon, applied.patch, {
          type: 'presentation_restore',
          blockId: icon.id,
          typename: icon.typename,
          parent,
          owner: { blockId: block.id, slot },
          fields: applied.fields
        })
      }
      continue
    }
    const applied = presentationPatch(block, command)
    addPatch(block, applied.patch, {
      type: 'presentation_restore',
      blockId: block.id,
      typename: block.typename,
      parent,
      ...(command.type === 'card_chat_set'
        ? { gate: 'aiChatEditor' as const }
        : {}),
      fields: applied.fields
    })
  }
  if (new Set(plans.map(({ blockId }) => blockId)).size > 200)
    throw new Error('LIMIT_EXCEEDED')
  return { plans, idMap }
}

export async function checkCardLayout(
  tx: Prisma.TransactionClient,
  journeyId: string,
  cardId: string,
  fullscreen: unknown
) {
  if (
    fullscreen === true &&
    (await tx.block.count({
      where: {
        journeyId,
        parentBlockId: cardId,
        typename: 'VideoBlock',
        deletedAt: null
      }
    }))
  )
    throw new Error('VALIDATION_FAILED')
}

/** Creation undo must detect later edits and added descendants, not erase them. */
export function createdState(
  block: Prisma.BlockGetPayload<Record<string, never>>
) {
  const { updatedAt, deletedAt, ...state } = block
  return state
}
