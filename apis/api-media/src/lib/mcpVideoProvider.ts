import { createHmac } from 'node:crypto'
import { Readable } from 'node:stream'

import { z } from 'zod'

import type { PrismaClient } from '@core/prisma/media/client'
import { boundedJson, sameSecret } from '@core/yoga/mcp/readContract'

class MuxCreationRejected extends Error {}

// The direct upload gets its own hour after staging completes.
const muxUploadLifetimeSeconds = 3600

const providerId = z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/)
const upload = z.object({
  id: providerId,
  status: z.enum([
    'waiting',
    'asset_created',
    'errored',
    'cancelled',
    'timed_out'
  ]),
  asset_id: providerId.optional(),
  url: z.string().optional(),
  new_asset_settings: z.object({ passthrough: z.string().optional() })
})
export type VideoUploadStatus =
  | { state: 'unknown' | 'allocated' | 'processing' | 'failed' | 'cancelled' }
  | { state: 'ready'; assetId: string; playbackId: string; duration: number }
export interface VideoUploadProvider {
  dispatch(
    id: string,
    input: AsyncIterable<Buffer>,
    size: number
  ): Promise<void | 'rejected'>
  status(id: string, cancel: boolean): Promise<VideoUploadStatus>
}

/** The UUID passthrough binds a single creation attempt to its durable job.
 * A lost creation response is reconciled by authenticated upload listing, never
 * another POST. Signed upload URLs remain inside this server-side adapter.
 */
export function muxUploadProvider(
  env: NodeJS.ProcessEnv,
  media: PrismaClient
): VideoUploadProvider {
  const tokenId = z.string().min(1).parse(env.MUX_UGC_ACCESS_TOKEN_ID)
  const secret = z.string().min(1).parse(env.MUX_UGC_SECRET_KEY)
  const authorization = `Basic ${Buffer.from(`${tokenId}:${secret}`).toString('base64')}`
  const request = async (path: string, method = 'GET', body?: unknown) => {
    const response = await fetch(`https://api.mux.com/video/v1/${path}`, {
      method,
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json'
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      redirect: 'error',
      signal: AbortSignal.timeout(10000)
    })
    if (path === 'uploads' && method === 'POST' && response.status === 429) {
      const refusal = z
        .object({ errors: z.array(z.string()).min(1) })
        .strict()
        .safeParse(
          await boundedJson(new Response(response.body)).catch(() => undefined)
        )
      // Mux documents that an empty rate-limit bucket does not process work.
      // Redirects/retries are disabled, so no earlier send is hidden here.
      if (refusal.success) throw new MuxCreationRejected()
    }
    if (!response.ok) throw new Error('DEPENDENCY_UNAVAILABLE')
    return boundedJson(response)
  }
  const recordUpload = async (id: string, value: z.infer<typeof upload>) => {
    if (value.new_asset_settings.passthrough !== id)
      throw new Error('VALIDATION_FAILED')
    await media.muxVideo.update({ where: { id }, data: { uploadId: value.id } })
    return value
  }
  async function findUpload(id: string) {
    const known = await media.muxVideo.findUniqueOrThrow({ where: { id } })
    if (known.uploadId) {
      const value = z
        .object({ data: upload })
        .parse(
          await request(`uploads/${encodeURIComponent(known.uploadId)}`)
        ).data
      if (
        value.id !== known.uploadId ||
        value.new_asset_settings.passthrough !== id
      )
        throw new Error('VALIDATION_FAILED')
      return value
    }
    // Bounded pages per observation. Absence cannot prove a failed creation.
    for (let page = 1; page <= 20; page++) {
      const values = z
        .object({ data: z.array(upload) })
        .parse(await request(`uploads?limit=100&page=${page}`)).data
      const matches = values.filter(
        (value) => value.new_asset_settings.passthrough === id
      )
      if (matches.length > 1) throw new Error('VALIDATION_FAILED')
      if (matches[0]) return recordUpload(id, matches[0])
      if (values.length < 100) return
    }
  }
  return {
    async dispatch(id, input, size) {
      let value: z.infer<typeof upload>
      try {
        value = await recordUpload(
          id,
          z.object({ data: upload }).parse(
            await request('uploads', 'POST', {
              timeout: muxUploadLifetimeSeconds,
              new_asset_settings: {
                passthrough: id,
                playback_policies: ['public'],
                video_quality: 'basic',
                max_resolution_tier: '1080p'
              }
            })
          ).data
        )
      } catch (error) {
        if (error instanceof MuxCreationRejected) return 'rejected'
        throw error
      }
      const url = new URL(value.url ?? '')
      if (
        value.status !== 'waiting' ||
        url.protocol !== 'https:' ||
        url.hostname !== 'storage.googleapis.com' ||
        url.username ||
        url.password ||
        url.port ||
        url.hash
      )
        throw new Error('VALIDATION_FAILED')
      const stream = Readable.from(input)
      try {
        const response = await fetch(url, {
          method: 'PUT',
          body: stream as unknown as BodyInit,
          headers: {
            'Content-Length': String(size),
            'Content-Type': 'application/octet-stream'
          },
          redirect: 'error',
          signal: AbortSignal.timeout(muxUploadLifetimeSeconds * 1000),
          ...{ duplex: 'half' }
        })
        await response.body?.cancel()
        if (!response.ok) throw new Error('DEPENDENCY_UNAVAILABLE')
      } finally {
        stream.destroy()
      }
    },
    async status(id, cancel) {
      let value = await findUpload(id)
      if (!value) return { state: 'unknown' }
      if (cancel && value.status === 'waiting') {
        value = z
          .object({ data: upload })
          .parse(
            await request(
              `uploads/${encodeURIComponent(value.id)}/cancel`,
              'PUT'
            )
          ).data
        if (value.new_asset_settings.passthrough !== id)
          throw new Error('VALIDATION_FAILED')
      }
      if (value.status === 'waiting') return { state: 'allocated' }
      if (value.status === 'cancelled' || value.status === 'timed_out')
        return { state: 'cancelled' }
      if (value.status === 'errored') return { state: 'failed' }
      if (!value.asset_id) return { state: 'unknown' }
      const asset = z
        .object({
          data: z.object({
            id: z.literal(value.asset_id),
            passthrough: z.literal(id),
            status: z.enum(['preparing', 'ready', 'errored']),
            duration: z.number().finite().optional(),
            playback_ids: z
              .array(
                z.object({
                  id: providerId,
                  policy: z.enum(['public', 'signed'])
                })
              )
              .optional(),
            tracks: z.array(z.object({ type: z.string() })).optional()
          })
        })
        .parse(
          await request(`assets/${encodeURIComponent(value.asset_id)}`)
        ).data
      if (asset.status === 'errored') return { state: 'failed' }
      if (asset.status !== 'ready') return { state: 'processing' }
      const playback = asset.playback_ids?.find(
        (value) => value.policy === 'public'
      )
      if (
        !playback ||
        !asset.duration ||
        asset.duration < 3 ||
        !asset.tracks?.some((track) => track.type === 'video')
      )
        return { state: 'failed' }
      return {
        state: 'ready',
        assetId: asset.id,
        playbackId: playback.id,
        duration: Math.floor(asset.duration)
      }
    }
  }
}

/** Authenticate exact raw bytes and freshness. Callback fields are only hints;
 * authenticated provider status remains the readiness authority.
 */
export function muxCallbackJob(
  raw: string,
  signature: string,
  secret: string,
  now = Date.now()
): string | undefined {
  const parts = signature.split(',').map((value) => value.trim())
  const timestamps = parts.filter((value) => value.startsWith('t='))
  if (timestamps.length !== 1) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  const timestamp = timestamps[0].slice(2)
  if (
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${raw}`)
    .digest('hex')
  if (
    !parts.some(
      (value) => value.startsWith('v1=') && sameSecret(value.slice(3), expected)
    )
  )
    throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
  const event = z
    .object({
      type: z.string(),
      data: z.object({
        passthrough: z.string().uuid().optional(),
        new_asset_settings: z
          .object({ passthrough: z.string().uuid().optional() })
          .optional()
      })
    })
    .parse(JSON.parse(raw))
  if (
    !event.type.startsWith('video.asset.') &&
    !event.type.startsWith('video.upload.')
  )
    return
  return event.data.passthrough ?? event.data.new_asset_settings?.passthrough
}
