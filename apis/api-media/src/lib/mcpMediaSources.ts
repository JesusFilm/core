import { createHmac } from 'node:crypto'

import type { Plugin } from 'graphql-yoga'
import { z } from 'zod'

import type { PrismaClient as JourneysDatabase } from '@core/prisma/journeys/client'
import type { PrismaClient as LanguagesDatabase } from '@core/prisma/languages/client'
import type {
  PrismaClient as MediaDatabase,
  Prisma
} from '@core/prisma/media/client'
import {
  type MediaResolutionSource,
  type ReadyMedia,
  mediaResolutionSource,
  mediaSearchInput,
  mediaSourceKey,
  readyVideo
} from '@core/yoga/mcp/mediaContract'
import {
  type ReadTrust,
  boundedJson,
  fingerprint,
  internalSignature,
  maxTransportBytes,
  postJson,
  readRequest,
  safeReadError,
  sameSecret,
  verifyReadCredential
} from '@core/yoga/mcp/readContract'

import {
  type MediaProviders,
  catalogStreamUrl,
  publicMediaUrl
} from './mcpMediaProviders'

export interface MediaSourcesConfig extends ReadTrust {
  internalSecret: string
  authorityUrl: string
  authoritySecret: string
  imageAccount: string
  flags: (
    userId: string
  ) => Promise<{ mediaLibrary: boolean; websiteMode: boolean }>
}
export const mediaSourceRequest = z
  .object({
    credential: z.string().max(32768),
    permitId: z.string().uuid(),
    request: readRequest,
    sources: z.array(mediaResolutionSource).max(200).optional(),
    search: mediaSearchInput.optional()
  })
  .strict()
  .refine((value) => Boolean(value.sources) !== Boolean(value.search))

function denied(): never {
  throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
}
// RestrictViewPlatforms lists the permitted platforms when nonempty.
const catalogWhere: Prisma.VideoWhereInput = {
  published: true,
  OR: [
    { restrictViewPlatforms: { isEmpty: true } },
    { restrictViewPlatforms: { has: 'journeys' } }
  ]
}

/** Real media-owned participant. The parent executor's captured source gate
 * covers this bounded source read and the later atomic attachment. Metadata
 * never leaves this endpoint without a fresh authority and owning-rights check.
 */
export function createMediaSourceHandler(
  config: MediaSourcesConfig,
  media: MediaDatabase,
  journeys: JourneysDatabase,
  languages: LanguagesDatabase,
  providers: MediaProviders
) {
  return async (request: Request): Promise<Response> => {
    try {
      if (
        request.method !== 'POST' ||
        request.headers.has('authorization') ||
        request.headers.has('interop-token')
      )
        denied()
      const body = mediaSourceRequest.parse(
        await boundedJson(new Response(request.body), maxTransportBytes)
      )
      if (
        !sameSecret(
          request.headers.get('x-mcp-signature') ?? '',
          internalSignature(
            body.credential,
            JSON.stringify(body),
            config.internalSecret
          )
        )
      )
        denied()
      const claims = verifyReadCredential(body.credential, config)
      if (
        fingerprint(body.request) !== claims.requestHash ||
        !('journeyId' in body.request.input)
      )
        denied()
      const journeyId = body.request.input.journeyId
      if (
        !claims.journeyIds.includes(journeyId) ||
        (body.search && body.search.journeyId !== journeyId)
      )
        denied()
      let sourceGeneration = -1
      const check = async () => {
        const authority = z
          .object({ generation: z.number().int() })
          .parse(
            await postJson(
              new URL('/internal/reads/media-check', config.authorityUrl).href,
              { credential: body.credential, permitId: body.permitId },
              `Bearer ${config.authoritySecret}`
            )
          )
        sourceGeneration = authority.generation
        const profile = await journeys.journeyProfile.findUnique({
          where: { userId: claims.subject }
        })
        const journey = await journeys.journey.findFirst({
          where: {
            id: journeyId,
            deletedAt: null,
            archivedAt: null,
            trashedAt: null,
            AND: [
              { OR: [{ template: false }, { template: null }] },
              { OR: [{ templateSite: false }, { templateSite: null }] },
              {
                OR: [
                  {
                    userJourneys: {
                      some: {
                        userId: claims.subject,
                        role: { in: ['owner', 'editor'] }
                      }
                    }
                  },
                  {
                    team: {
                      userTeams: {
                        some: {
                          userId: claims.subject,
                          role: { in: ['manager', 'member'] }
                        }
                      }
                    }
                  }
                ]
              }
            ]
          },
          include: {
            revision: true,
            team: {
              include: {
                userTeams: {
                  where: {
                    userId: claims.subject,
                    role: { in: ['manager', 'member'] }
                  }
                }
              }
            }
          }
        })
        if (
          !profile?.acceptedTermsAt ||
          !journey ||
          !['draft', 'published'].includes(journey.status)
        )
          denied()
        return journey
      }
      const journey = await check()
      const flags = await config.flags(claims.subject)
      const owner = journey.team.userTeams.length
        ? { OR: [{ userId: claims.subject }, { teamId: journey.teamId }] }
        : { userId: claims.subject }
      const imageUrl = (id: string) =>
        publicMediaUrl(
          `https://imagedelivery.net/${encodeURIComponent(config.imageAccount)}/${encodeURIComponent(id)}/public`
        )
      const resolve = async (
        source: MediaResolutionSource
      ): Promise<ReadyMedia> => {
        if (source.source === 'library') {
          if (!flags.mediaLibrary) denied()
          const image = await media.cloudflareImage.findFirst({
            where: { id: source.id, uploaded: true, ...owner }
          })
          if (!image) denied()
          return providers.image(imageUrl(image.id))
        }
        if (source.source === 'history' || source.source === 'existingImage') {
          let image: {
            src: string | null
            width: number | null
            height: number | null
            blurhash: string | null
          } | null
          if (
            body.request.tool === 'journey_undo' ||
            body.request.tool === 'journey_redo'
          ) {
            const history = await journeys.mcpEditHistory.findFirst({
              where: {
                id: body.request.input.entryId,
                journeyId,
                namespaceId: claims.connectionId,
                historyGeneration: claims.consentHistoryGeneration
              }
            })
            const side =
              body.request.tool === 'journey_undo' ? 'before' : 'after'
            const inverses = z
              .array(
                z.object({
                  type: z.literal('structure_restore'),
                  blocks: z.array(
                    z.object({
                      id: z.string(),
                      before: z.unknown(),
                      after: z.unknown()
                    })
                  )
                })
              )
              .parse(history?.changes)
            const restored = inverses
              .flatMap((inverse) => inverse.blocks)
              .find((block) => block.id === source.blockId)?.[side]
            image = z
              .object({
                typename: z.literal('ImageBlock'),
                deletedAt: z.null(),
                src: z.string().nullable(),
                width: z.number().nullable(),
                height: z.number().nullable(),
                blurhash: z.string().nullable()
              })
              .parse(restored)
          } else {
            if (source.source === 'history' && !flags.mediaLibrary) denied()
            image = await journeys.block.findFirst({
              where: {
                id: source.blockId,
                journeyId,
                typename: 'ImageBlock',
                deletedAt: null
              }
            })
          }
          if (!image?.src) denied()
          const src = publicMediaUrl(image.src),
            url = new URL(src)
          if (url.hostname === 'imagedelivery.net') {
            if (!flags.mediaLibrary) denied()
            const parts = url.pathname.split('/').filter(Boolean)
            if (parts[0] !== config.imageAccount || !parts[1]) denied()
            const asset = await media.cloudflareImage.findFirst({
              where: {
                id: decodeURIComponent(parts[1]),
                uploaded: true,
                ...owner
              }
            })
            if (!asset) denied()
          } else if (url.hostname !== 'images.unsplash.com') denied()
          return providers.image(src)
        }
        if (source.source === 'unsplash') return providers.unsplash(source.id)
        if (source.source === 'youTube') {
          const { subtitleBcp47, ...metadata } = await providers.youtube(
            source.videoId
          )
          const subtitles = await languages.language.findMany({
            where: { bcp47: { in: subtitleBcp47, mode: 'insensitive' } },
            select: { id: true }
          })
          return readyVideo.parse({
            ...metadata,
            subtitleLanguageIds: subtitles.map(({ id }) => id),
            kind: 'video',
            source: 'youTube',
            videoId: source.videoId,
            videoVariantLanguageId: null
          })
        }
        if (source.source === 'mux') {
          if (!flags.mediaLibrary) denied()
          const video = await media.muxVideo.findFirst({
            where: {
              id: source.videoId,
              readyToStream: true,
              playbackId: { not: null },
              duration: { gte: 3 },
              ...owner
            },
            include: {
              subtitles: { where: { status: 'ready', source: 'generated' } }
            }
          })
          if (
            !video?.playbackId ||
            !/^[a-zA-Z0-9_-]{1,200}$/.test(video.playbackId)
          )
            denied()
          await providers.catalog(
            `https://stream.mux.com/${video.playbackId}.m3u8`
          )
          const subtitles = await languages.language.findMany({
            where: {
              bcp47: {
                in: video.subtitles.map((track) => track.bcp47),
                mode: 'insensitive'
              }
            },
            select: { id: true }
          })
          return readyVideo.parse({
            kind: 'video',
            source: 'mux',
            videoId: video.id,
            videoVariantLanguageId: null,
            title: video.name,
            description: null,
            image: publicMediaUrl(
              `https://image.mux.com/${video.playbackId}/thumbnail.png?time=1`
            ),
            duration: video.duration,
            subtitleLanguageIds: subtitles.map(({ id }) => id)
          })
        }
        const video = await media.video.findFirst({
          where: { id: source.videoId, ...catalogWhere },
          include: {
            variants: {
              where: {
                languageId: source.languageId,
                published: true,
                hls: { not: null },
                duration: { gte: 3 }
              }
            },
            title: { where: { primary: true }, take: 1 },
            description: { where: { primary: true }, take: 1 },
            images: { where: { uploaded: true }, take: 1 }
          }
        })
        const variant = video?.variants[0]
        if (!video || !variant) denied()
        if (
          !(await languages.language.findUnique({
            where: { id: source.languageId },
            select: { id: true }
          }))
        )
          denied()
        catalogStreamUrl(variant.hls!)
        await providers.catalog(variant.hls!)
        return readyVideo.parse({
          kind: 'video',
          source: 'internal',
          videoId: video.id,
          videoVariantLanguageId: variant.languageId,
          title: null,
          description: null,
          image: null,
          duration: variant.duration,
          subtitleLanguageIds: []
        })
      }
      let data: unknown
      if (body.sources) {
        const values: Record<string, ReadyMedia> = Object.create(null)
        for (const source of body.sources)
          values[mediaSourceKey(source)] = await resolve(source)
        data = { sources: values, flags }
      } else {
        const search = body.search!,
          take = search.limit
        const binding = fingerprint([
          claims.subject,
          claims.connectionId,
          claims.grantVersion,
          journeyId,
          journey.revision?.revision.toString(),
          sourceGeneration,
          { ...search, cursor: undefined }
        ])
        let skip = 0
        if (search.cursor) {
          const [payload, signature, extra] = search.cursor.split('.')
          if (
            !payload ||
            !signature ||
            extra ||
            !sameSecret(
              signature,
              createHmac('sha256', config.internalSecret)
                .update(payload)
                .digest('hex')
            )
          )
            throw new Error('VALIDATION_FAILED')
          const page = z
            .object({
              binding: z.string(),
              offset: z.number().int().nonnegative().max(100000)
            })
            .strict()
            .parse(
              JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
            )
          if (page.binding !== binding) throw new Error('REVISION_CONFLICT')
          skip = page.offset
        }
        const query = 'query' in search ? search.query?.trim() : undefined
        if (
          ['library', 'history', 'mux'].includes(search.source) &&
          !flags.mediaLibrary
        )
          denied()
        if (search.source === 'library') {
          const images = await media.cloudflareImage.findMany({
            where: {
              uploaded: true,
              AND: [
                owner,
                ...(search.isAi === true
                  ? [{ isAi: true }]
                  : search.isAi === false
                    ? [{ OR: [{ isAi: false }, { isAi: null }] }]
                    : [])
              ]
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: take + 1,
            skip
          })
          data = {
            items: images.slice(0, take).map((image) => ({
              id: image.id,
              source: 'library',
              preview: imageUrl(image.id)
            })),
            hasMore: images.length > take
          }
        } else if (search.source === 'history') {
          const images = await journeys.block.findMany({
            where: {
              journeyId,
              typename: 'ImageBlock',
              deletedAt: null,
              src: { not: null },
              ...(query
                ? { alt: { contains: query, mode: 'insensitive' } }
                : {})
            },
            orderBy: { id: 'asc' },
            take: take + 1,
            skip
          })
          const items = []
          for (const image of images.slice(0, take)) {
            try {
              const resolved = await resolve({
                source: 'history',
                blockId: image.id
              })
              if (resolved.kind === 'image')
                items.push({
                  blockId: image.id,
                  source: 'history',
                  preview: resolved.src,
                  alt: image.alt
                })
            } catch (error) {
              if (
                !(error instanceof Error) ||
                !['ACCESS_DENIED_OR_NOT_FOUND', 'VALIDATION_FAILED'].includes(
                  error.message
                )
              )
                throw new Error('DEPENDENCY_UNAVAILABLE', { cause: error })
            }
          }
          data = { items, hasMore: images.length > take }
        } else if (search.source === 'unsplash') {
          data = {
            items: await providers.searchUnsplash(
              query || 'nature',
              Math.floor(skip / take) + 1,
              take
            ),
            hasMore: true
          }
        } else if (search.source === 'youTube') {
          data = {
            items: [
              await resolve({ source: 'youTube', videoId: search.videoId })
            ],
            hasMore: false
          }
        } else if (search.source === 'mux') {
          const videos = await media.muxVideo.findMany({
            where: {
              ...owner,
              ...(search.videoId ? { id: search.videoId } : {}),
              readyToStream: true,
              playbackId: { not: null },
              duration: { gte: 3 },
              ...(query
                ? { name: { contains: query, mode: 'insensitive' } }
                : {})
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: take + 1,
            skip
          })
          data = {
            items: await Promise.all(
              videos
                .slice(0, take)
                .map((video) => resolve({ source: 'mux', videoId: video.id }))
            ),
            hasMore: videos.length > take
          }
        } else if (search.source === 'languages') {
          if (
            !(await media.video.findFirst({
              where: { id: search.videoId, ...catalogWhere },
              select: { id: true }
            }))
          )
            denied()
          const variants = await media.videoVariant.findMany({
            where: {
              videoId: search.videoId,
              published: true,
              hls: { not: null },
              duration: { gte: 3 }
            },
            orderBy: { languageId: 'asc' },
            take: take + 1,
            skip
          })
          const names = await languages.language.findMany({
            where: {
              id: {
                in: variants.slice(0, take).map((variant) => variant.languageId)
              }
            },
            select: {
              id: true,
              bcp47: true,
              name: {
                where: { primary: true },
                take: 1,
                select: { value: true }
              }
            }
          })
          data = {
            items: names.map((language) => ({
              languageId: language.id,
              bcp47: language.bcp47,
              name: language.name[0]?.value ?? null
            })),
            hasMore: variants.length > take
          }
        } else {
          const videos = await media.video.findMany({
            where: {
              ...catalogWhere,
              ...(search.videoId ? { id: search.videoId } : {}),
              variants: {
                some: {
                  published: true,
                  hls: { not: null },
                  duration: { gte: 3 }
                }
              },
              ...(query
                ? {
                    title: {
                      some: { value: { contains: query, mode: 'insensitive' } }
                    }
                  }
                : {})
            },
            include: { title: { where: { primary: true }, take: 1 } },
            orderBy: { id: 'asc' },
            take: take + 1,
            skip
          })
          data = {
            items: videos.slice(0, take).map((video) => ({
              videoId: video.id,
              source: 'internal',
              title: video.title[0]?.value ?? null
            })),
            hasMore: videos.length > take
          }
        }
        const result = z
          .object({ items: z.array(z.unknown()), hasMore: z.boolean() })
          .parse(data)
        const payload = Buffer.from(
          JSON.stringify({ binding, offset: skip + take })
        ).toString('base64url')
        data = {
          items: result.items,
          revision: journey.revision?.revision.toString(),
          nextCursor: result.hasMore
            ? `${payload}.${createHmac('sha256', config.internalSecret).update(payload).digest('hex')}`
            : null
        }
      }
      const current = await check()
      if (current.teamId !== journey.teamId) denied()
      if (current.revision?.revision !== journey.revision?.revision)
        throw new Error('REVISION_CONFLICT')
      if (
        fingerprint(await config.flags(claims.subject)) !== fingerprint(flags)
      )
        denied()
      return Response.json(
        { data },
        { headers: { 'Cache-Control': 'private, no-store' } }
      )
    } catch (error) {
      return Response.json(
        { error: safeReadError(error, 'DEPENDENCY_UNAVAILABLE') },
        { status: 403, headers: { 'Cache-Control': 'private, no-store' } }
      )
    }
  }
}

export function useMcpMediaSources(
  handler?: ReturnType<typeof createMediaSourceHandler>
): Plugin {
  return {
    async onRequest(payload) {
      const { request } = payload
      if (
        new URL(request.url, 'http://localhost').pathname !==
        '/mcp/media-sources'
      ) {
        if (
          request.headers.has('x-mcp-context') ||
          request.headers.has('x-mcp-signature') ||
          /^MCP /i.test(request.headers.get('authorization') ?? '')
        )
          payload.endResponse(
            Response.json(
              { error: 'ACCESS_DENIED_OR_NOT_FOUND' },
              { status: 403, headers: { 'Cache-Control': 'private, no-store' } }
            )
          )
        return
      }
      payload.endResponse(
        handler
          ? await handler(request)
          : Response.json(
              { error: 'ACCESS_DENIED_OR_NOT_FOUND' },
              { status: 403, headers: { 'Cache-Control': 'private, no-store' } }
            )
      )
    }
  }
}
