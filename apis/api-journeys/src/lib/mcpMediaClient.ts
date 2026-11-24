import { z } from 'zod'

import type { PrismaClient } from '@core/prisma/journeys/client'
import {
  type MediaResolutionSource,
  type ReadyMedia,
  mediaCommandNames,
  mediaSourceKey,
  readyImage,
  readyVideo
} from '@core/yoga/mcp/mediaContract'
import {
  type ReadRequest,
  boundedJson,
  internalSignature
} from '@core/yoga/mcp/readContract'

import type { MediaProjection } from './mcpMedia'
import { structureInverseSchema } from './mcpStructureState'

export interface MediaClientConfig {
  url: string
  internalSecret: string
}
export async function mediaRequest(
  config: MediaClientConfig,
  credential: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const input = { credential, ...body }
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mcp-signature': internalSignature(
        credential,
        JSON.stringify(input),
        config.internalSecret
      )
    },
    body: JSON.stringify(input),
    redirect: 'error',
    signal: AbortSignal.timeout(15000)
  })
  const value = z
    .object({
      data: z.unknown().optional(),
      error: z
        .enum([
          'ACCESS_DENIED_OR_NOT_FOUND',
          'DEPENDENCY_UNAVAILABLE',
          'VALIDATION_FAILED',
          'LIMIT_EXCEEDED',
          'REVISION_CONFLICT'
        ])
        .optional()
    })
    .strict()
    .parse(await boundedJson(response))
  if (value.error) throw new Error(value.error)
  if (!response.ok || !value.data) throw new Error('DEPENDENCY_UNAVAILABLE')
  return value.data
}
export function hasMediaCommands(request: ReadRequest): boolean {
  return (
    request.tool === 'journey_edit' &&
    request.input.commands.some((command) =>
      (mediaCommandNames as readonly string[]).includes(command.type)
    )
  )
}

/** Resolve outside the content transaction. The captured source gate remains
 * a dependency through final acceptance and the durable executor receipt.
 */
export async function resolveEditMedia(
  config: MediaClientConfig,
  credential: string,
  permitId: string,
  request: ReadRequest,
  db: PrismaClient,
  connectionId: string,
  historyGeneration: number,
  journey: { website: boolean | null; languageId: string }
): Promise<MediaProjection> {
  const sources = new Map<string, MediaResolutionSource>()
  const add = (source: MediaResolutionSource) =>
    sources.set(mediaSourceKey(source), source)
  const video = (row: {
    source: unknown
    videoId: unknown
    videoVariantLanguageId: unknown
  }) => {
    if (typeof row.videoId !== 'string') throw new Error('VALIDATION_FAILED')
    if (
      row.source === 'internal' &&
      typeof row.videoVariantLanguageId === 'string'
    )
      add({
        source: 'internal',
        videoId: row.videoId,
        languageId: row.videoVariantLanguageId
      })
    else if (row.source === 'mux' || row.source === 'youTube')
      add({ source: row.source, videoId: row.videoId })
    else throw new Error('VALIDATION_FAILED')
  }
  if (request.tool === 'journey_edit') {
    const duplicates = request.input.commands.filter(
      (command) =>
        command.type === 'step_duplicate' || command.type === 'block_duplicate'
    )
    if (duplicates.length) {
      const rows = await db.block.findMany({
        where: { journeyId: request.input.journeyId, deletedAt: null },
        take: 100001
      })
      if (rows.length > 100000) throw new Error('LIMIT_EXCEEDED')
      for (const command of duplicates) {
        if (!('id' in command.source)) continue
        const sourceId = command.source.id
        const queue = rows.filter((row) => row.id === sourceId)
        for (let index = 0; index < queue.length; index++) {
          if (queue.length > 200) throw new Error('LIMIT_EXCEEDED')
          const row = queue[index]
          if (row.typename === 'ImageBlock' && row.src)
            add({ source: 'existingImage', blockId: row.id })
          if (row.typename === 'VideoBlock' && row.videoId) video(row)
          queue.push(...rows.filter((child) => child.parentBlockId === row.id))
        }
      }
    }
    for (const command of request.input.commands) {
      if (command.type === 'image_set' && command.source) add(command.source)
      if (command.type === 'video_source_set') add(command.source)
      if (command.type === 'media_slot_set') add(command.media.source)
      if (command.type === 'video_settings_set') {
        const previous = request.input.commands.find(
          (candidate) =>
            candidate.type === 'video_source_set' &&
            JSON.stringify(candidate.block) === JSON.stringify(command.block)
        )
        if (previous?.type === 'video_source_set') add(previous.source)
        else if ('id' in command.block) {
          const block = await db.block.findFirst({
            where: {
              id: command.block.id,
              journeyId: request.input.journeyId,
              deletedAt: null,
              typename: 'VideoBlock'
            }
          })
          if (!block) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
          video(block)
        } else throw new Error('VALIDATION_FAILED')
      }
    }
  } else if (
    request.tool === 'journey_undo' ||
    request.tool === 'journey_redo'
  ) {
    const history = await db.mcpEditHistory.findFirst({
      where: {
        id: request.input.entryId,
        namespaceId: connectionId,
        journeyId: request.input.journeyId,
        historyGeneration
      }
    })
    const parsed = z.array(structureInverseSchema).safeParse(history?.changes)
    if (parsed.success)
      for (const inverse of parsed.data)
        for (const change of inverse.blocks) {
          const row =
            request.tool === 'journey_undo' ? change.before : change.after
          if (row.deletedAt !== null) continue
          if (
            row.typename === 'ImageBlock' &&
            row.src &&
            change.fields.some((field) => ['src', 'deletedAt'].includes(field))
          )
            add({ source: 'history', blockId: change.id })
          if (
            row.typename === 'VideoBlock' &&
            row.videoId &&
            change.fields.some((field) =>
              [
                'source',
                'videoId',
                'videoVariantLanguageId',
                'deletedAt',
                'startAt',
                'endAt',
                'objectFit',
                'subtitleLanguageId',
                'showGeneratedSubtitles',
                'muted',
                'autoplay'
              ].includes(field)
            )
          )
            video(row)
        }
  }
  const response = z
    .object({
      sources: z.record(z.string(), z.union([readyImage, readyVideo])),
      flags: z.object({ mediaLibrary: z.boolean(), websiteMode: z.boolean() })
    })
    .strict()
    .parse(
      await mediaRequest(config, credential, {
        permitId,
        request,
        sources: [...sources.values()]
      })
    )
  const values = new Map<string, ReadyMedia>(Object.entries(response.sources))
  if ([...sources.keys()].some((key) => !values.has(key)))
    throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  return {
    sources: values,
    website: journey.website,
    languageId: journey.languageId,
    websiteMode: response.flags.websiteMode
  }
}
