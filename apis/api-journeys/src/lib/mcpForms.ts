import { randomUUID } from 'node:crypto'

import type { Prisma } from '@core/prisma/journeys/client'
import { validSelectionBounds } from '@core/yoga/mcp/formContent'
import type { FormCommand } from '@core/yoga/mcp/formContract'
import type {
  ActionValue,
  BlockReference,
  ContentCreate,
  Placement
} from '@core/yoga/mcp/structureContract'

import { type ContentBlock, assertOwnedIcon } from './mcpContent'
import { formLabel } from './mcpFormLabels'
import { live } from './mcpStructureState'
import {
  type BlockState,
  type StructureState,
  children,
  idOf,
  requiredString,
  siblingsFrom
} from './mcpStructureState'

export interface FormPlanner {
  state: StructureState
  allocate: (key: string) => string
  create: (typename: string, id: string, parent: string) => BlockState
  resolve: (ref: BlockReference, type?: string) => BlockState
  claim: (id: string, field: string) => void
  cardFor: (row: BlockState) => BlockState
  insert: (row: BlockState, placement: Placement) => void
  setAction: (row: BlockState, action: ActionValue) => void
  remove: (row: BlockState) => void
}
type FormContent = Extract<
  ContentCreate,
  { kind: 'poll' | 'multiselect' | 'response' }
>

export function validateBounds(row: BlockState, count: number): void {
  if (!validSelectionBounds(row.min, row.max, count))
    throw new Error('VALIDATION_FAILED')
}

export function responsePatch(
  command:
    | Extract<FormCommand, { type: 'response_set' }>
    | Extract<FormContent, { kind: 'response' }>
) {
  const { locale, responseType, ...input } = command
  const patch = Object.fromEntries(
    Object.entries(input).filter(
      ([key, value]) =>
        !['block', 'kind', 'type'].includes(key) && value !== undefined
    )
  )
  if (responseType !== undefined) {
    patch.type = responseType
    patch.label =
      command.label ??
      formLabel(
        responseType === 'email'
          ? 'Email'
          : responseType === 'name'
            ? 'Name'
            : responseType === 'phone'
              ? 'Phone'
              : 'Label',
        locale
      )
    if (!['email', 'name'].includes(responseType)) {
      patch.integrationId = null
      patch.routeId = null
    }
  }
  return patch
}

/** Create only typed owned children. Shared submit controls are completed once
 * all Card content has been projected, before route commands are evaluated. */
export function createFormContent(
  planner: Pick<FormPlanner, 'create' | 'allocate' | 'claim'>,
  id: string,
  cardId: string,
  content: FormContent
): BlockState {
  const row = planner.create(
    content.kind === 'poll'
      ? 'RadioQuestionBlock'
      : content.kind === 'multiselect'
        ? 'MultiselectBlock'
        : 'TextResponseBlock',
    id,
    cardId
  )
  if (content.kind === 'response') {
    Object.assign(row, {
      type: 'freeForm',
      label: formLabel('Label', content.locale),
      ...responsePatch(content)
    })
    for (const field of Object.keys(responsePatch(content)))
      planner.claim(id, field)
  } else {
    if (content.kind === 'poll') {
      row.gridView = content.gridView ?? false
      if (content.gridView !== undefined) planner.claim(id, 'gridView')
    } else {
      row.min = content.min ?? null
      row.max = content.max ?? null
      if (content.min !== undefined) planner.claim(id, 'min')
      if (content.max !== undefined) planner.claim(id, 'max')
    }
    content.options.forEach((option, index) => {
      const child = planner.create(
        content.kind === 'poll' ? 'RadioOptionBlock' : 'MultiselectOptionBlock',
        planner.allocate(option.key),
        id
      )
      child.label = option.label
      child.parentOrder = index
      planner.claim(idOf(child), 'label')
    })
    if (content.kind === 'multiselect')
      validateBounds(row, content.options.length)
  }
  return row
}

export function applyFormCommand(p: FormPlanner, command: FormCommand): void {
  if (
    command.type === 'poll_option_add' ||
    command.type === 'multiselect_option_add'
  ) {
    const poll = command.type === 'poll_option_add'
    const parent = p.resolve(
      command.question,
      poll ? 'RadioQuestionBlock' : 'MultiselectBlock'
    )
    p.cardFor(parent)
    p.state.optionAddChecks.add(idOf(parent))
    const row = p.resolve(
      { local: command.key },
      poll ? 'RadioOptionBlock' : 'MultiselectOptionBlock'
    )
    p.insert(row, command.placement)
    if (command.type === 'poll_option_add' && command.action)
      p.setAction(row, command.action)
    return
  }
  if (command.type === 'options_reorder') {
    const question = p.resolve(command.question)
    if (
      !['RadioQuestionBlock', 'MultiselectBlock'].includes(
        requiredString(question.typename)
      )
    )
      throw new Error('VALIDATION_FAILED')
    p.cardFor(question)
    const current = siblingsFrom(p.state.blocks, idOf(question))
    const ids = command.options.map((ref) =>
      idOf(
        p.resolve(
          ref,
          question.typename === 'RadioQuestionBlock'
            ? 'RadioOptionBlock'
            : 'MultiselectOptionBlock'
        )
      )
    )
    if (
      ids.length !== current.length ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !current.includes(id))
    )
      throw new Error('VALIDATION_FAILED')
    p.state.siblingParents.add(idOf(question))
    ids.forEach((id, index) => {
      p.claim(id, 'parentOrder')
      p.state.blocks.get(id)!.parentOrder = index
    })
    return
  }
  const type = command.type.startsWith('poll_option')
    ? 'RadioOptionBlock'
    : command.type.startsWith('multiselect_option')
      ? 'MultiselectOptionBlock'
      : command.type === 'poll_set'
        ? 'RadioQuestionBlock'
        : command.type === 'multiselect_set'
          ? 'MultiselectBlock'
          : command.type.startsWith('signup')
            ? 'SignUpBlock'
            : 'TextResponseBlock'
  const row = p.resolve(command.block, type)
  if (command.type === 'multiselect_set') p.state.boundChecks.add(idOf(row))
  if (type.endsWith('OptionBlock')) {
    const parent = p.resolve(
      { id: requiredString(row.parentBlockId) },
      type === 'RadioOptionBlock' ? 'RadioQuestionBlock' : 'MultiselectBlock'
    )
    p.cardFor(parent)
  } else p.cardFor(row)
  if (
    command.type === 'poll_option_remove' ||
    command.type === 'multiselect_option_remove'
  ) {
    p.remove(row)
    return
  }
  let patch: Record<string, unknown>
  if (command.type === 'form_destination_set') {
    p.state.destinationChecks.add(idOf(row))
    if (!['email', 'name'].includes(requiredString(row.type)))
      throw new Error('VALIDATION_FAILED')
    patch = {
      integrationId: command.integrationId,
      routeId:
        command.routeId !== undefined
          ? command.routeId
          : command.integrationId === row.integrationId
            ? row.routeId
            : null
    }
    if (command.integrationId === null) patch.routeId = null
  } else if (command.type === 'response_set') patch = responsePatch(command)
  else if (command.type === 'signup_icon_set') {
    let icon: BlockState
    if (row.submitIconId === null) {
      icon = p.create('IconBlock', randomUUID(), idOf(row))
      p.claim(idOf(row), 'submitIconId')
      row.submitIconId = icon.id
    } else
      icon = p.resolve({ id: requiredString(row.submitIconId) }, 'IconBlock')
    if (icon.parentBlockId !== row.id) throw new Error('VALIDATION_FAILED')
    if (command.name !== undefined) {
      p.claim(idOf(icon), 'name')
      icon.name = command.name
    }
    if (command.color !== undefined) {
      p.claim(idOf(icon), 'color')
      icon.color = command.color
    }
    return
  } else
    patch = Object.fromEntries(
      Object.entries(command).filter(
        ([key, value]) =>
          !['type', 'block'].includes(key) && value !== undefined
      )
    )
  for (const field of Object.keys(patch)) p.claim(idOf(row), field)
  Object.assign(row, patch)
}

export function validateForms(
  state: StructureState,
  changed: Set<string>,
  legacyBounds = new Set<string>()
) {
  const questions = new Set([...state.boundChecks, ...state.optionAddChecks])
  for (const id of changed) {
    const row = state.blocks.get(id),
      before = state.originalBlocks.get(id)
    if (!row) continue
    if (
      row.typename === 'MultiselectBlock' &&
      live(before) &&
      (row.min !== before?.min || row.max !== before?.max)
    )
      questions.add(id)
    if (
      row.typename === 'MultiselectOptionBlock' &&
      live(row) !== live(before) &&
      typeof row.parentBlockId === 'string' &&
      live(state.originalBlocks.get(row.parentBlockId))
    )
      questions.add(row.parentBlockId)
  }
  for (const id of questions) {
    const row = state.blocks.get(id)
    if (!row || row.deletedAt !== null) continue
    if (
      row.typename === 'MultiselectBlock' ||
      row.typename === 'RadioQuestionBlock'
    ) {
      const count = children(state, id).filter(
        (child) =>
          child.typename ===
          (row.typename === 'MultiselectBlock'
            ? 'MultiselectOptionBlock'
            : 'RadioOptionBlock')
      ).length
      if (state.optionAddChecks.has(id) && count > 12)
        throw new Error('LIMIT_EXCEEDED')
      if (row.typename === 'MultiselectBlock' && !legacyBounds.has(id))
        validateBounds(row, count)
    }
  }
}

/** SignUp owns its legacy submit slot; aliases introduced by later edits must
 * not let a label/icon change mutate another owner's child. */
export async function validateFormIcons(
  tx: Prisma.TransactionClient,
  state: StructureState
) {
  for (const [id, row] of state.blocks) {
    if (
      !live(row) ||
      row.typename !== 'SignUpBlock' ||
      row.submitIconId === null
    )
      continue
    const iconId = requiredString(row.submitIconId)
    const icon = state.blocks.get(iconId)
    const changed =
      state.created.has(iconId) ||
      JSON.stringify(row) !== JSON.stringify(state.originalBlocks.get(id)) ||
      JSON.stringify(icon) !== JSON.stringify(state.originalBlocks.get(iconId))
    if (!changed) continue
    if (!live(icon)) throw new Error('HISTORY_CONFLICT')
    await assertOwnedIcon(
      tx,
      row as unknown as ContentBlock,
      icon as unknown as ContentBlock,
      state.blocks as unknown as Map<string, ContentBlock>
    )
  }
}
