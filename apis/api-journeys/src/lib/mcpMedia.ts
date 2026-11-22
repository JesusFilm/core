import { randomUUID } from 'node:crypto'

import type { Prisma } from '@core/prisma/journeys/client'
import {
  type MediaCommand,
  type MediaSlot,
  type ReadyMedia,
  type ReadyVideo,
  type VideoSettings,
  mediaSourceKey
} from '@core/yoga/mcp/mediaContract'
import type { BlockReference } from '@core/yoga/mcp/structureContract'

import {
  type BlockField,
  type BlockState,
  StructurePlan,
  type StructureState,
  emptyBlock,
  idOf,
  live,
  parentOf,
  requiredString
} from './mcpStructureState'

export interface MediaProjection {
  sources: ReadonlyMap<string, ReadyMedia>
  website: boolean | null
  websiteMode: boolean
  languageId?: string
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
function checkLogo(projection?: MediaProjection): void {
  if (!projection?.websiteMode || projection.website !== true) denied()
}

type PlaybackState = Partial<
  Pick<
    BlockState,
    | 'source'
    | 'startAt'
    | 'endAt'
    | 'objectFit'
    | 'autoplay'
    | 'muted'
    | 'subtitleLanguageId'
    | 'showGeneratedSubtitles'
  >
>
function validatePlayback(
  row: PlaybackState,
  metadata: ReadyVideo,
  facts: {
    website: boolean
    background: boolean
    fullscreen: boolean
    validateSubtitles: boolean
    languageId?: string
  }
): void {
  const start = row.startAt ?? 0,
    end = row.endAt ?? metadata.duration,
    source = row.source ?? 'internal',
    subtitle = row.subtitleLanguageId ?? null
  if (
    typeof start !== 'number' ||
    typeof end !== 'number' ||
    start < 0 ||
    end > metadata.duration ||
    end - start < 3
  )
    invalid()
  if ((source === 'youTube' || facts.website) && row.objectFit !== 'fit')
    invalid()
  if (row.showGeneratedSubtitles === true && source !== 'mux') invalid()
  if (source === 'internal' && subtitle !== null) invalid()
  if (
    source === 'mux' &&
    (row.showGeneratedSubtitles === true) !== (subtitle !== null)
  )
    invalid()
  if (facts.validateSubtitles && subtitle !== null) {
    if (source === 'mux' && subtitle !== facts.languageId) invalid()
    if (metadata.subtitleStatus === 'unavailable')
      throw new Error('DEPENDENCY_UNAVAILABLE')
    if (
      typeof subtitle !== 'string' ||
      !metadata.subtitleLanguageIds.includes(subtitle)
    )
      invalid()
  }
  if (
    facts.background &&
    (!facts.fullscreen ||
      row.autoplay !== true ||
      row.muted !== true ||
      subtitle !== null ||
      row.showGeneratedSubtitles === true)
  )
    invalid()
  if (!facts.fullscreen) invalid()
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
        if (state.journey.logoImageBlockId === id) checkLogo(media)
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
  const checkVideo = (
    row: BlockState,
    metadata: ReadyVideo,
    validateSubtitles = true
  ): void => {
    const isBackground = background(row)
    let card = row
    while (card.typename !== 'CardBlock') {
      const parent = parentOf(card)
      if (!parent) denied()
      card = get(parent)
    }
    validatePlayback(row, metadata, {
      website: media?.website === true,
      background: isBackground,
      fullscreen: card.fullscreen !== false,
      validateSubtitles,
      languageId: media?.languageId
    })
  }
  const setVideo = (
    row: BlockState,
    source: Extract<MediaCommand, { type: 'video_source_set' }>['source'],
    settings?: VideoSettings
  ) => {
    const value = sourceFor(source, 'video')
    if (value.kind !== 'video') denied()
    const patch: Partial<BlockState> = {
      source: value.source,
      videoId: value.videoId,
      videoVariantLanguageId: value.videoVariantLanguageId,
      title: value.title,
      description: value.description,
      image: value.image,
      duration: value.duration,
      startAt: 0,
      endAt: value.duration,
      subtitleLanguageId: null,
      showGeneratedSubtitles: false,
      ...(value.source === 'youTube' || media?.website === true
        ? { objectFit: 'fit' }
        : {}),
      ...(background(row) ? { muted: true, autoplay: true } : {}),
      ...settings
    }
    for (const field of Object.keys(patch) as BlockField[])
      set(row, field, patch[field]!)
    checkVideo(row, value)
  }
  const removeOwned = (root: BlockState): void => {
    const queue = [root]
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
  const slot = (target: MediaSlot) => {
    if (target.slot === 'logo' || target.slot === 'social') {
      if (target.slot === 'logo') checkLogo(media)
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
      : state.journey[target.field]
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
    if (remove) removeOwned(current)
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
      } else setVideo(next, command.media.source, command.media.settings)
    }
    if (target.owner)
      target.owner[target.field as BlockField] = next?.id ?? null
    else state.journey[target.field] = next?.id ?? null
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
  } else if (command.type === 'video_source_clear') {
    if (row.parentOrder === null) invalid()
    if (typeof row.posterBlockId === 'string') {
      const poster = get(row.posterBlockId, 'ImageBlock')
      if (poster.parentBlockId !== row.id || poster.parentOrder !== null)
        denied()
      removeOwned(poster)
    }
    set(row, 'source', 'internal')
    for (const field of [
      'videoId',
      'videoVariantLanguageId',
      'title',
      'description',
      'image',
      'duration',
      'startAt',
      'endAt',
      'posterBlockId',
      'subtitleLanguageId'
    ] as const)
      set(row, field, null)
    set(row, 'showGeneratedSubtitles', false)
  } else if (command.type === 'video_source_set')
    setVideo(row, command.source, command.settings)
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
    checkVideo(
      row,
      videoMetadata(row),
      command.subtitleLanguageId !== undefined ||
        command.showGeneratedSubtitles !== undefined
    )
  }
}

/** Inverses are content changes too. Revalidate the restored source and source
 * controls against current owner facts instead of trusting yesterday's duration
 * or resurrecting a revoked private asset.
 */
export async function validateMediaPlan(
  tx: Prisma.TransactionClient,
  plan: StructurePlan,
  projection?: MediaProjection,
  currentWebsite = projection?.website === true
): Promise<void> {
  for (const id of plan.blockWrites.map((write) => write.id).sort())
    await tx.$queryRaw`SELECT id FROM "Block" WHERE id = ${id} FOR UPDATE`
  if (
    Object.prototype.hasOwnProperty.call(
      plan.journeyPatch,
      'logoImageBlockId'
    ) ||
    (await tx.journey.findFirst({
      where: {
        id: plan.journeyId,
        logoImageBlockId: { in: plan.blockWrites.map((write) => write.id) }
      },
      select: { id: true }
    }))
  )
    checkLogo(
      projection
        ? {
            ...projection,
            website:
              projection.website ||
              (currentWebsite &&
                Object.prototype.hasOwnProperty.call(
                  plan.journeyPatch,
                  'website'
                ))
          }
        : undefined
    )
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
        'alt',
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
    if (row.typename === 'ImageBlock' || row.typename === 'VideoBlock') {
      const references = await tx.block.findMany({
        where: {
          OR: [
            { coverBlockId: write.id },
            { posterBlockId: write.id },
            { pollOptionImageBlockId: write.id }
          ]
        }
      })
      let owners = 0
      for (const reference of references) {
        if (reference.journeyId !== plan.journeyId) denied()
        const owner = await get(reference.id)
        for (const field of [
          'coverBlockId',
          'posterBlockId',
          'pollOptionImageBlockId'
        ] as const) {
          if (owner[field] !== write.id) continue
          const expected = {
            coverBlockId: 'CardBlock',
            posterBlockId: 'VideoBlock',
            pollOptionImageBlockId: 'RadioOptionBlock'
          }[field]
          if (
            owner.journeyId !== plan.journeyId ||
            owner.id !== row.parentBlockId ||
            owner.typename !== expected ||
            row.parentOrder !== null ||
            (field !== 'coverBlockId' && row.typename !== 'ImageBlock')
          )
            denied()
          owners++
        }
      }
      const roots = await tx.journey.findMany({
        where: {
          OR: [
            { logoImageBlockId: write.id },
            { primaryImageBlockId: write.id }
          ]
        },
        select: { id: true, logoImageBlockId: true, primaryImageBlockId: true }
      })
      for (const owner of roots) {
        if (owner.id !== plan.journeyId) denied()
        for (const field of [
          'logoImageBlockId',
          'primaryImageBlockId'
        ] as const) {
          const reference = Object.prototype.hasOwnProperty.call(
            plan.journeyPatch,
            field
          )
            ? plan.journeyPatch[field]
            : owner[field]
          if (reference !== write.id) continue
          if (
            row.parentBlockId !== null ||
            row.parentOrder !== null ||
            row.typename !== 'ImageBlock'
          )
            denied()
          owners++
        }
      }
      if (owners > 1) denied()
    }
    if (
      row.deletedAt !== null ||
      typeof row.typename !== 'string' ||
      !['ImageBlock', 'VideoBlock'].includes(row.typename)
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
            videoId: requiredString(row.videoId),
            languageId: requiredString(row.videoVariantLanguageId ?? null)
          })
        : row.source === 'mux' || row.source === 'youTube'
          ? mediaSourceKey({
              source: row.source,
              videoId: requiredString(row.videoId)
            })
          : denied()
    const source = projection?.sources.get(key)
    if (!source || source.kind !== 'video') denied()
    const isBackground = row.parentOrder === null
    let card = row
    const ancestors = new Set<string>()
    while (card.typename !== 'CardBlock') {
      const parentId = requiredString(card.parentBlockId ?? null)
      if (ancestors.has(parentId)) invalid()
      ancestors.add(parentId)
      card = await get(parentId)
    }
    if (
      isBackground &&
      (card?.typename !== 'CardBlock' || card.coverBlockId !== write.id)
    )
      invalid()
    validatePlayback(row, source, {
      website: projection?.website === true,
      background: isBackground,
      fullscreen: card?.fullscreen !== false,
      languageId: projection?.languageId,
      validateSubtitles: Boolean(
        attaching ||
          fields.some((field) =>
            [
              'source',
              'videoId',
              'subtitleLanguageId',
              'showGeneratedSubtitles'
            ].includes(field)
          )
      )
    })
  }
}
