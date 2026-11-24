import { randomUUID } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { Prisma } from '@core/prisma/journeys/client'
import {
  type AppearanceCommand,
  fontFields,
  normalizeChatLink
} from '@core/yoga/mcp/appearanceContract'

import type { StructurePlan } from './mcpStructureState'

const value = z.string().nullable()
const theme = z
  .object({
    id: z.string(),
    journeyId: z.string(),
    userId: z.string(),
    createdAt: z.string(),
    headerFont: value,
    bodyFont: value,
    labelFont: value
  })
  .strict()
const chat = z
  .object({
    id: z.string(),
    journeyId: z.string(),
    link: value,
    platform: value,
    customizable: z.boolean().nullable()
  })
  .strict()
export const entityChange = z.union([
  z
    .object({
      kind: z.literal('theme'),
      id: z.string(),
      fields: z.array(z.enum(fontFields)),
      before: theme.nullable(),
      after: theme.nullable()
    })
    .strict(),
  z
    .object({
      kind: z.literal('chat'),
      id: z.string(),
      fields: z.array(z.enum(['platform', 'link'])),
      before: chat.nullable(),
      after: chat.nullable()
    })
    .strict()
])
type EntityChange = z.infer<typeof entityChange>
export type EntityWrite = EntityChange

export async function appearanceEntities(
  tx: Prisma.TransactionClient,
  journeyId: string,
  actorId: string
) {
  const themeKey = Symbol('theme')
  const changes = new Map<string | symbol, EntityChange>()
  const claims = new Set<string>()
  const claim = (id: string, fields: string[]) => {
    for (const field of fields) {
      const key = `${id}\0${field}`
      if (claims.has(key) || claims.has(`${id}\0removed`))
        throw new Error('VALIDATION_FAILED')
      claims.add(key)
    }
  }
  let chats: Map<string, z.infer<typeof chat>> | undefined
  const loadChats = async () => {
    if (!chats)
      chats = new Map(
        (await tx.chatButton.findMany({ where: { journeyId } })).map((row) => [
          row.id,
          chat.parse({
            id: row.id,
            journeyId,
            link: row.link,
            platform: row.platform,
            customizable: row.customizable
          })
        ])
      )
    return chats
  }
  return {
    async apply(command: AppearanceCommand, allocate: (key: string) => string) {
      if (command.type === 'journey_fonts_set') {
        const fields = fontFields.filter(
          (field) => command[field] !== undefined
        )
        claim('theme', fields)
        const prior = changes.get(themeKey)
        if (prior && prior.kind !== 'theme')
          throw new Error('VALIDATION_FAILED')
        const stored = prior
          ? null
          : await tx.journeyTheme.findUnique({ where: { journeyId } })
        const before =
          prior?.before ??
          (stored
            ? theme.parse({
                ...Object.fromEntries(
                  Object.keys(theme.shape).map((key) => [
                    key,
                    stored[key as keyof typeof stored]
                  ])
                ),
                createdAt: stored.createdAt.toISOString()
              })
            : null)
        const after = {
          ...(prior?.after ??
            before ?? {
              id: randomUUID(),
              journeyId,
              userId: actorId,
              createdAt: new Date().toISOString(),
              headerFont: null,
              bodyFont: null,
              labelFont: null
            })
        }
        for (const field of fields) after[field] = command[field]!
        changes.set(themeKey, {
          kind: 'theme',
          id: after.id,
          fields: [
            ...new Set([...(prior?.fields ?? []), ...fields])
          ] as (typeof fontFields)[number][],
          before: before,
          after
        })
        return
      }
      if (
        !['chat_button_add', 'chat_button_set', 'chat_button_remove'].includes(
          command.type
        )
      )
        return
      const rows = await loadChats()
      if (command.type === 'chat_button_add') {
        if (rows.size >= 2) throw new Error('VALIDATION_FAILED')
        const id = allocate(command.key)
        const after = {
          id,
          journeyId,
          platform: command.platform,
          link: command.link === null ? null : normalizeChatLink(command.link),
          customizable: null
        }
        rows.set(id, after)
        changes.set(id, {
          kind: 'chat',
          id,
          fields: ['platform', 'link'],
          before: null,
          after
        })
      } else if (
        command.type === 'chat_button_set' ||
        command.type === 'chat_button_remove'
      ) {
        const row = rows.get(command.chatButtonId)
        if (!row) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        const prior = changes.get(row.id)
        if (prior?.kind === 'theme') throw new Error('VALIDATION_FAILED')
        const before = prior ? prior.before : { ...row }
        if (command.type === 'chat_button_remove') {
          if (prior) throw new Error('VALIDATION_FAILED')
          claim(`chat:${row.id}`, ['removed'])
          changes.set(row.id, {
            kind: 'chat',
            id: row.id,
            fields: ['platform', 'link'],
            before,
            after: null
          })
          rows.delete(row.id)
          return
        }
        const fields = (['platform', 'link'] as const).filter(
          (field) => command[field] !== undefined
        )
        claim(`chat:${row.id}`, [...fields])
        if (command.platform !== undefined) row.platform = command.platform
        if (command.link !== undefined)
          row.link =
            command.link === null ? null : normalizeChatLink(command.link)
        changes.set(row.id, {
          kind: 'chat',
          id: row.id,
          fields: [...new Set([...(prior?.fields ?? []), ...fields])],
          before,
          after: { ...row }
        })
      }
    },
    finish(plan: StructurePlan) {
      const entities = [...changes.values()].flatMap((change) => {
        if (isDeepStrictEqual(change.before, change.after)) return []
        if (change.before && change.after) {
          if (change.kind === 'theme')
            change.fields = change.fields.filter(
              (field) => change.before?.[field] !== change.after?.[field]
            )
          else
            change.fields = change.fields.filter(
              (field) => change.before?.[field] !== change.after?.[field]
            )
        }
        return [entityChange.parse(change)]
      })
      if (!entities.length) return
      plan.changes[0] ??= {
        type: 'structure_restore',
        owners: [],
        blocks: [],
        actions: [],
        journey: [],
        siblings: []
      }
      plan.changes[0].entities = entities
      plan.entityWrites = entities
      plan.objectCount += entities.length
      if (plan.objectCount > 200) throw new Error('LIMIT_EXCEEDED')
      for (const entity of entities)
        plan.changedFields.push({
          blockId: entity.id,
          fields:
            entity.before === null
              ? ['created']
              : entity.after === null
                ? ['removed']
                : entity.fields
        })
    }
  }
}

/** Stored descriptors never accept caller patches. Compare only affected fields
 * for an update, and the complete owned row before creating/removing an entity. */
export async function planEntityHistory(
  tx: Prisma.TransactionClient,
  journeyId: string,
  changes: EntityChange[],
  direction: 'undo' | 'redo'
): Promise<EntityWrite[]> {
  const writes: EntityWrite[] = []
  let chatCount = await tx.chatButton.count({ where: { journeyId } })
  for (const change of changes) {
    const expected = change[direction === 'undo' ? 'after' : 'before']
    const next = change[direction === 'undo' ? 'before' : 'after']
    if (
      [expected, next].some(
        (row) => row && (row.journeyId !== journeyId || row.id !== change.id)
      )
    )
      throw new Error('HISTORY_UNAVAILABLE')
    const stored =
      change.kind === 'theme'
        ? await tx.journeyTheme.findUnique({ where: { journeyId } })
        : await tx.chatButton.findUnique({ where: { id: change.id } })
    const current = !stored
      ? null
      : change.kind === 'theme'
        ? theme.parse({
            ...Object.fromEntries(
              Object.keys(theme.shape).map((key) => [
                key,
                stored[key as keyof typeof stored]
              ])
            ),
            createdAt:
              'createdAt' in stored ? stored.createdAt.toISOString() : ''
          })
        : chat.parse(
            Object.fromEntries(
              Object.keys(chat.shape).map((key) => [
                key,
                stored[key as keyof typeof stored]
              ])
            )
          )
    if (
      current?.id !== expected?.id ||
      current?.journeyId !== expected?.journeyId
    )
      throw new Error('HISTORY_CONFLICT')
    if (!current || !expected || !next) {
      if (!isDeepStrictEqual(current, expected))
        throw new Error('HISTORY_CONFLICT')
    } else if (
      change.fields.some(
        (field) =>
          current[field as keyof typeof current] !==
          expected[field as keyof typeof expected]
      )
    )
      throw new Error('HISTORY_CONFLICT')
    if (change.kind === 'chat')
      chatCount += Number(Boolean(next)) - Number(Boolean(current))
    writes.push({ ...change, before: expected, after: next } as EntityWrite)
  }
  if (changes.some((change) => change.kind === 'chat') && chatCount > 2)
    throw new Error('HISTORY_CONFLICT')
  return writes
}

export async function executeEntities(
  tx: Prisma.TransactionClient,
  writes: EntityWrite[],
  afterChild?: () => Promise<void>
) {
  for (const write of writes) {
    if (write.kind === 'theme') {
      if (write.after === null)
        await tx.journeyTheme.delete({ where: { id: write.id } })
      else if (write.before === null)
        await tx.journeyTheme.create({
          data: { ...write.after, createdAt: new Date(write.after.createdAt) }
        })
      else
        await tx.journeyTheme.update({
          where: { id: write.id },
          data: Object.fromEntries(
            write.fields.map((field) => [field, write.after![field]])
          )
        })
    } else {
      if (write.after === null)
        await tx.chatButton.delete({ where: { id: write.id } })
      else if (write.before === null)
        await tx.chatButton.create({
          data: write.after as Prisma.ChatButtonUncheckedCreateInput
        })
      else
        await tx.chatButton.update({
          where: { id: write.id },
          data: Object.fromEntries(
            write.fields.map((field) => [field, write.after![field]])
          )
        })
    }
    await afterChild?.()
  }
}
