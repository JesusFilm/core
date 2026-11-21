import { randomUUID } from 'node:crypto'

import {
  type MediaCommand,
  type MediaSlot,
  type ReadyMedia,
  type ReadyVideo,
  mediaSourceKey
} from '@core/yoga/mcp/mediaContract'
import type { BlockReference } from '@core/yoga/mcp/structureContract'

import {
  type BlockField,
  type BlockState,
  type StructureState,
  emptyBlock,
  idOf,
  live,
  parentOf,
  requiredString
} from './mcpStructureState'
import type { Prisma } from '@core/prisma/journeys/client'
import type { StructurePlan } from './mcpStructureState'

export interface MediaProjection {
  sources: ReadonlyMap<string, ReadyMedia>
  website: boolean | null
  websiteMode: boolean
}
interface ProjectionContext {
  state: StructureState
  resolve: (reference: BlockReference, type?: string) => BlockState
  claim: (id: string, field: string) => void
  now: string
  media?: MediaProjection
}
function invalid(): never {
  throw new Error('VALIDATION_FAILED')
}
function denied(): never {
  throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
}

/** Applies complete media gestures to the same projected graph as other edits.
 * Sources have already been authorized by their owner. No URL fetching or
 * provider mutation belongs in the content transaction.
 */
export function applyMedia(
  command: MediaCommand,
  context: ProjectionContext
): void {
  const { state, resolve, claim, now, media } = context
  const get = (id: string, typename?: string): BlockState => {
    const row = state.blocks.get(id)
    if (!live(row) || (typename && row.typename !== typename)) denied()
    return row
  }
  const set = (
    row: BlockState,
    field: BlockField,
    value: BlockState[BlockField]
  ) => {
    claim(idOf(row), field)
    row[field] = value
  }
  const own = (row: BlockState): void => {
    let current = row
    const seen = new Set<string>()
    while (current.typename !== 'StepBlock') {
      const id = idOf(current)
      if (seen.has(id)) invalid()
      seen.add(id)
      const parent = parentOf(current)
      if (parent === null) {
        if (
          current.typename === 'ImageBlock' &&
          [
            state.journey.logoImageBlockId,
            state.journey.primaryImageBlockId
          ].includes(id)
        )
          return
        denied()
      }
      const owner = get(parent)
      if (
        current.typename === 'ImageBlock' &&
        current.parentOrder === null &&
        ![
          owner.coverBlockId,
          owner.posterBlockId,
          owner.pollOptionImageBlockId
        ].includes(id)
      )
        denied()
      if (
        current.typename === 'VideoBlock' &&
        current.parentOrder === null &&
        owner.coverBlockId !== id
      )
        denied()
      current = owner
    }
    if (current.parentBlockId !== null) denied()
    const cards = [...state.blocks.values()].filter(
      (row) =>
        live(row) &&
        row.parentBlockId === current.id &&
        row.typename === 'CardBlock'
    )
    if (cards.length !== 1) denied()
  }
  const sourceFor = (
    source: Parameters<typeof mediaSourceKey>[0],
    kind: ReadyMedia['kind']
  ): ReadyMedia => {
    const resolved = media?.sources.get(mediaSourceKey(source))
    if (!resolved || resolved.kind !== kind) denied()
    return resolved
  }
  const setImage = (
    row: BlockState,
    source: Extract<MediaCommand, { type: 'image_set' }>['source']
  ) => {
    if (!source) return
    const resolved = sourceFor(source, 'image')
    if (resolved.kind !== 'image') denied()
    for (const field of ['src', 'width', 'height', 'blurhash'] as const)
      set(row, field, resolved[field])
  }
  const background = (row: BlockState) =>
    row.parentOrder === null &&
    parentOf(row) !== null &&
    get(parentOf(row)!).coverBlockId === row.id
  const videoMetadata = (row: BlockState): ReadyVideo => {
    if (!media || typeof row.videoId !== 'string') denied()
    const source: Parameters<typeof mediaSourceKey>[0] =
      row.source === 'internal'
        ? {
            source: 'internal' as const,
            videoId: row.videoId,
            languageId: requiredString(row.videoVariantLanguageId)
          }
        : row.source === 'youTube' || row.source === 'mux'
          ? { source: row.source, videoId: row.videoId }
          : denied()
    const value = sourceFor(source, 'video')
    if (value.kind !== 'video') denied()
    return value
  }
  const checkVideo = (row: BlockState, metadata: ReadyVideo): void => {
    const start = row.startAt ?? 0,
      end = row.endAt ?? metadata.duration
    if (
      typeof start !== 'number' ||
      typeof end !== 'number' ||
      start < 0 ||
      end > metadata.duration ||
      end - start < 3
    )
      invalid()
    if (
      (row.source === 'youTube' || media?.website === true) &&
      row.objectFit !== 'fit'
    )
      invalid()
    if (background(row)) {
      if (
        row.autoplay !== true ||
        row.muted !== true ||
        row.subtitleLanguageId !== null ||
        row.showGeneratedSubtitles === true
      )
        invalid()
      const card = get(parentOf(row)!, 'CardBlock')
      if (card.fullscreen === false) invalid()
    }
    if (row.showGeneratedSubtitles === true && row.source !== 'mux') invalid()
    if (row.source === 'internal' && row.subtitleLanguageId !== null) invalid()
    if (
      typeof row.subtitleLanguageId === 'string' &&
      !metadata.subtitleLanguageIds.includes(row.subtitleLanguageId)
    )
      invalid()
    if (
      row.source === 'mux' &&
      (row.showGeneratedSubtitles === true) !==
        (row.subtitleLanguageId !== null)
    )
      invalid()
  }
  const setVideo = (
    row: BlockState,
    source: Extract<MediaCommand, { type: 'video_source_set' }>['source']
  ) => {
    const value = sourceFor(source, 'video')
    if (value.kind !== 'video') denied()
    for (const field of [
      'source',
      'videoId',
      'videoVariantLanguageId',
      'title',
      'description',
      'image',
      'duration'
    ] as const)
      set(row, field, value[field])
    set(row, 'startAt', 0)
    set(row, 'endAt', value.duration)
    set(row, 'subtitleLanguageId', null)
    set(row, 'showGeneratedSubtitles', false)
    if (value.source === 'youTube' || media?.website === true)
      set(row, 'objectFit', 'fit')
    if (background(row)) {
      set(row, 'muted', true)
      set(row, 'autoplay', true)
    }
    checkVideo(row, value)
  }
  const slot = (target: MediaSlot) => {
    if (target.slot === 'logo' || target.slot === 'social') {
      if (
        target.slot === 'logo' &&
        (!media?.websiteMode || media.website !== true)
      )
        denied()
      return {
        owner: null,
        field:
          target.slot === 'logo'
            ? ('logoImageBlockId' as const)
            : ('primaryImageBlockId' as const)
      }
    }
    const owner = resolve(
      target.owner,
      { cover: 'CardBlock', poster: 'VideoBlock', poll: 'RadioOptionBlock' }[
        target.slot
      ]
    )
    own(owner)
    return {
      owner,
      field: {
        cover: 'coverBlockId',
        poster: 'posterBlockId',
        poll: 'pollOptionImageBlockId'
      }[target.slot] as
        | 'coverBlockId'
        | 'posterBlockId'
        | 'pollOptionImageBlockId'
    }
  }
  if (
    command.type === 'media_slot_set' ||
    command.type === 'media_slot_clear'
  ) {
    const target = slot(command.target),
      ownerId = target.owner ? idOf(target.owner) : state.journey.id
    claim(ownerId, target.field)
    const currentId = target.owner
      ? target.owner[target.field as BlockField]
      : state.journey[
          target.field as 'logoImageBlockId' | 'primaryImageBlockId'
        ]
    const current = typeof currentId === 'string' ? get(currentId) : null
    if (
      current &&
      (parentOf(current) !== (target.owner ? ownerId : null) ||
        current.parentOrder !== null ||
        ![
          'ImageBlock',
          ...(command.target.slot === 'cover' ? ['VideoBlock'] : [])
        ].includes(requiredString(current.typename)))
    )
      denied()
    const desiredType =
      command.type === 'media_slot_set' && command.media.kind === 'video'
        ? 'VideoBlock'
        : 'ImageBlock'
    const remove =
      current &&
      (command.type === 'media_slot_clear' || current.typename !== desiredType)
    if (remove) {
      const queue = [current]
      while (queue.length) {
        const row = queue.shift()!
        for (const field of Object.keys(row)) claim(idOf(row), field)
        row.deletedAt = now
        queue.push(
          ...[...state.blocks.values()].filter(
            (child) => live(child) && child.parentBlockId === row.id
          )
        )
      }
    }
    let next: BlockState | null = null
    if (command.type === 'media_slot_set') {
      next =
        current && !remove
          ? current
          : emptyBlock(state.journey.id, desiredType, randomUUID())
      if (next !== current) {
        next.parentBlockId = target.owner ? ownerId : null
        next.parentOrder = null
        next.alt = ''
        next.autoplay = desiredType === 'VideoBlock' ? true : null
        next.muted = desiredType === 'VideoBlock' ? true : null
        next.fullsize = desiredType === 'VideoBlock' ? true : null
        state.blocks.set(idOf(next), next)
        state.created.add(idOf(next))
      }
      if (target.owner) target.owner[target.field as BlockField] = next.id
      if (command.media.kind === 'image') {
        setImage(next, command.media.source)
        if (command.media.alt !== undefined) set(next, 'alt', command.media.alt)
      } else setVideo(next, command.media.source)
    }
    if (target.owner)
      target.owner[target.field as BlockField] = next?.id ?? null
    else
      state.journey[
        target.field as 'logoImageBlockId' | 'primaryImageBlockId'
      ] = next?.id ?? null
    return
  }
  const row = resolve(
    command.block,
    command.type.startsWith('image_') ? 'ImageBlock' : 'VideoBlock'
  )
  own(row)
  if (command.type === 'image_source_clear') {
    if (row.parentOrder === null) invalid()
    set(row, 'src', null)
    set(row, 'alt', '')
  } else if (command.type === 'image_set') {
    setImage(row, command.source)
    for (const field of ['alt', 'scale', 'focalLeft', 'focalTop'] as const)
      if (command[field] !== undefined) set(row, field, command[field])
  } else if (command.type === 'video_source_set') setVideo(row, command.source)
  else {
    if (
      (command.showGeneratedSubtitles !== undefined ||
        command.subtitleLanguageId !== undefined) &&
      row.source === 'mux' &&
      (command.showGeneratedSubtitles === undefined ||
        command.subtitleLanguageId === undefined)
    )
      invalid()
    if (command.showGeneratedSubtitles !== undefined && row.source !== 'mux')
      invalid()
    if (
      command.subtitleLanguageId !== undefined &&
      !['mux', 'youTube'].includes(requiredString(row.source))
    )
      invalid()
    for (const field of [
      'objectFit',
      'startAt',
      'endAt',
      'muted',
      'autoplay',
      'subtitleLanguageId',
      'showGeneratedSubtitles'
    ] as const)
      if (command[field] !== undefined) set(row, field, command[field])
    checkVideo(row, videoMetadata(row))
  }
}

/** Inverses are content changes too. Revalidate the restored source and source
 * controls against current owner facts instead of trusting yesterday's duration
 * or resurrecting a revoked private asset.
 */
export async function validateMediaPlan(
  tx: Prisma.TransactionClient,
  plan: StructurePlan,
  projection?: MediaProjection
): Promise<void> {
  const get = async (id: string) => {
    const current = await tx.block.findUnique({
      where: { id, journeyId: plan.journeyId }
    })
    const write = plan.blockWrites.find((write) => write.id === id)
    return { ...current, ...(write?.create ?? write?.patch) }
  }
  for (const write of plan.blockWrites) {
    const fields = Object.keys(write.create ?? write.patch)
    const attaching = write.create || write.patch.deletedAt === null
    const changedMedia = fields.some((field) =>
      [
        'src',
        'source',
        'videoId',
        'videoVariantLanguageId',
        'objectFit',
        'startAt',
        'endAt',
        'subtitleLanguageId',
        'showGeneratedSubtitles',
        'muted',
        'autoplay',
        'focalLeft',
        'focalTop',
        'scale'
      ].includes(field)
    )
    if (!attaching && !changedMedia) continue
    const row = await get(write.id)
    if (
      row.deletedAt !== null ||
      !['ImageBlock', 'VideoBlock'].includes(String(row.typename))
    )
      continue
    if (row.typename === 'ImageBlock') {
      if (!row.src || (!attaching && !fields.includes('src'))) continue
      if (
        !projection ||
        ![...projection.sources.values()].some(
          (source) => source.kind === 'image' && source.src === row.src
        )
      )
        denied()
      continue
    }
    if (!row.videoId) continue
    const key =
      row.source === 'internal'
        ? mediaSourceKey({
            source: 'internal',
            videoId: String(row.videoId),
            languageId: String(row.videoVariantLanguageId)
          })
        : row.source === 'mux' || row.source === 'youTube'
          ? mediaSourceKey({ source: row.source, videoId: String(row.videoId) })
          : denied()
    const source = projection?.sources.get(key)
    if (!source || source.kind !== 'video') denied()
    const start = row.startAt ?? 0,
      end = row.endAt ?? source.duration
    if (
      typeof start !== 'number' ||
      typeof end !== 'number' ||
      start < 0 ||
      end > source.duration ||
      end - start < 3
    )
      invalid()
    if (
      (row.source === 'youTube' || projection?.website) &&
      row.objectFit !== 'fit'
    )
      invalid()
    if (row.showGeneratedSubtitles === true && row.source !== 'mux') invalid()
    if (
      row.subtitleLanguageId &&
      !source.subtitleLanguageIds.includes(String(row.subtitleLanguageId))
    )
      invalid()
    if (
      row.source === 'mux' &&
      (row.showGeneratedSubtitles === true) !== Boolean(row.subtitleLanguageId)
    )
      invalid()
    if (row.parentOrder === null) {
      const card = row.parentBlockId
        ? await get(String(row.parentBlockId))
        : null
      if (
        card?.typename !== 'CardBlock' ||
        card.coverBlockId !== write.id ||
        card.fullscreen === false ||
        row.muted !== true ||
        row.autoplay !== true ||
        row.subtitleLanguageId ||
        row.showGeneratedSubtitles === true
      )
        invalid()
    }
  }
  if (
    plan.journeyPatch.logoImageBlockId &&
    (!projection?.websiteMode || !projection.website)
  )
    denied()
}
