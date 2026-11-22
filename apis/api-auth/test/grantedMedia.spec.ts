import { createServer } from 'node:http'

import { buildSchema, graphql } from 'graphql'
import { createYoga } from 'graphql-yoga'

import { PrismaClient as LanguagesDatabase } from '@core/prisma/languages/client'
import {
  PrismaClient as MediaDatabase,
  sourceTransaction,
  transactionScopedMediaClient
} from '@core/prisma/media/client'
import { PrismaPg } from '@prisma/adapter-pg'

/* eslint-disable @nx/enforce-module-boundaries -- Exercise the real separately deployed media participant. */
import { createMediaMutationGuard } from '../../api-media/src/lib/mcpMediaMutations'
import type { MediaProviders } from '../../api-media/src/lib/mcpMediaProviders'
import { mediaRuntime } from '../../api-media/src/lib/mcpMediaRuntime'

/* eslint-enable @nx/enforce-module-boundaries */
import { structureFixture } from './grantedStructureFixture'

const authUrl = process.env.MEDIA_TEST_AUTH_DATABASE_URL
const journeysUrl = process.env.MEDIA_TEST_JOURNEYS_DATABASE_URL
const mediaUrl = process.env.MEDIA_TEST_MEDIA_DATABASE_URL
const languagesUrl = process.env.MEDIA_TEST_LANGUAGES_DATABASE_URL

describe('media through the real authorized HTTP and owning-store boundary', () => {
  if (![authUrl, journeysUrl, mediaUrl, languagesUrl].every(Boolean))
    throw new Error(
      'Run node tools/scripts/test-mcp-media.mjs with isolated issue 10559 databases'
    )
  if (
    !/^\/media_issue_10559(_|$)/.test(new URL(mediaUrl!).pathname) ||
    !/^\/languages_issue_10559(_|$)/.test(new URL(languagesUrl!).pathname)
  )
    throw new Error('Use isolated issue 10559 media and languages databases')
  const media = new MediaDatabase({
    adapter: new PrismaPg({ connectionString: mediaUrl })
  })
  const languages = new LanguagesDatabase({
    adapter: new PrismaPg({ connectionString: languagesUrl })
  })
  let guard: ReturnType<typeof createMediaMutationGuard>
  let flags = { mediaLibrary: true, websiteMode: true }
  let providerFailure = false
  let captionsUnavailable = false
  const readyImage = {
    kind: 'image' as const,
    width: 1200,
    height: 800,
    blurhash: 'trusted-media-blurhash'
  }
  const providers: MediaProviders = {
    async catalog() {
      if (providerFailure) throw new Error('controlled unready catalog stream')
    },
    async image(src) {
      if (providerFailure)
        throw new Error('credential-sentinel raw-provider-failure')
      return { ...readyImage, src }
    },
    async unsplash(id) {
      if (providerFailure)
        throw new Error('credential-sentinel raw-provider-failure')
      return { ...readyImage, src: `https://images.unsplash.com/${id}` }
    },
    async searchUnsplash() {
      if (providerFailure) throw new Error('credential-sentinel')
      return [
        {
          id: 'synthetic-photo',
          preview: 'https://images.unsplash.com/synthetic-photo',
          alt: 'Synthetic photo'
        }
      ]
    },
    async youtube() {
      if (providerFailure) throw new Error('credential-sentinel')
      return {
        title: 'Synthetic YouTube',
        description: 'Trusted provider description',
        image: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg',
        duration: 90,
        subtitleBcp47: captionsUnavailable ? [] : ['en'],
        subtitleStatus: captionsUnavailable ? 'unavailable' : 'ready'
      }
    }
  }
  const mediaSecret = 'controlled-media-authority-10559-at-least-32-characters'
  const mutationSecret =
    'controlled-media-mutations-10559-at-least-32-characters'
  const internalSecret =
    'controlled-media-internal-10559-at-least-32-characters'
  const f = structureFixture({
    issue: '10559',
    startupTimeoutMs: 120000,
    authUrl,
    journeysUrl,
    authEnv: {
      AUTH_READ_MEDIA_SECRET: mediaSecret,
      AUTH_PERMISSION_MEDIA_SECRET: mutationSecret
    },
    async media({ config, journeys, publicKey, listen }) {
      await media.mcpMediaMutation.deleteMany()
      const runtime = mediaRuntime(
        {
          MCP_MEDIA_ENABLED: 'true',
          MCP_READ_ISSUER: config.AUTH_ISSUER,
          MCP_READ_GATEWAY_AUDIENCE: config.AUTH_READ_GATEWAY_AUDIENCE,
          MCP_READ_ENVIRONMENT: 'local',
          MCP_READ_PUBLIC_KEY: JSON.stringify(publicKey),
          MEDIA_MCP_INTERNAL_SECRET: internalSecret,
          MEDIA_MCP_AUTHORITY_SECRET: mediaSecret,
          MCP_READ_AUTHORITY_URL: config.AUTH_ISSUER,
          MCP_PERMISSION_MEDIA_SECRET: mutationSecret,
          CLOUDFLARE_IMAGE_ACCOUNT: 'synthetic-account'
        },
        {
          media,
          journeys,
          languages,
          providers,
          flags: async () => ({ ...flags })
        }
      )
      guard = runtime.mutations!
      const yoga = createYoga({
        schema: buildSchema('type Query { ping: Boolean }'),
        plugins: runtime.plugins,
        logging: false
      })
      const url = await listen(
        createServer((request, response) => {
          void yoga(request, response)
        })
      )
      return { url: url + '/mcp/media-sources', internalSecret }
    }
  })
  const protectedMedia = transactionScopedMediaClient(media)
  const ref = (suffix: string) => ({ id: f.id(suffix) })
  const image = (suffix = 'image') =>
    f.journeys.block.findUniqueOrThrow({ where: { id: f.id(suffix) } })
  const selectImage = (id = f.id('asset')) => ({
    type: 'image_set',
    block: ref('image'),
    source: { source: 'library', id }
  })
  const renameButton = () => ({
    type: 'button_set',
    blockId: f.id('button'),
    label: 'Explore'
  })
  const selectVideo = (source = { source: 'mux', videoId: f.id('mux') }) => ({
    type: 'video_source_set',
    block: ref('video'),
    source
  })
  const search = (source: string, more: Record<string, unknown> = {}) =>
    f.call('journey_media_search', { journeyId: f.journeyId, source, ...more })
  async function reject(commands: unknown[]) {
    const before = await f.snapshot()
    const result = await f.edit(await f.input(commands))
    expect(result.json.result?.isError, result.text).toBe(true)
    expect(await f.snapshot()).toEqual(before)
    expect(result.text).not.toContain('credential-sentinel')
    return result
  }
  async function settleMedia() {
    await vi.waitFor(
      async () =>
        expect(
          await f.auth.readPermit.count({ where: { status: 'accepted' } })
        ).toBe(0),
      { timeout: 5000 }
    )
    await guard.recover()
  }

  beforeEach(async () => {
    flags = { mediaLibrary: true, websiteMode: true }
    providerFailure = false
    captionsUnavailable = false
    for (const [id, bcp47] of [
      ['529', 'en'],
      ['21028', 'es']
    ])
      await languages.language.upsert({
        where: { id },
        create: { id, bcp47 },
        update: { bcp47 }
      })
    await media.cloudflareImage.createMany({
      data: [
        { id: f.id('asset'), userId: 'alice', uploaded: true },
        {
          id: f.id('team-asset'),
          userId: 'bob',
          teamId: 'structure-team-alice',
          uploaded: true
        },
        { id: f.id('foreign-asset'), userId: 'bob', uploaded: true },
        { id: f.id('unready'), userId: 'alice', uploaded: false }
      ]
    })
    await media.muxVideo.create({
      data: {
        id: f.id('mux'),
        userId: 'alice',
        name: 'Synthetic Mux',
        duration: 120,
        playbackId: f.id('playback').replaceAll('-', ''),
        readyToStream: true,
        subtitles: {
          create: {
            trackId: f.id('track'),
            source: 'generated',
            status: 'ready',
            bcp47: 'en'
          }
        }
      }
    })
    await media.video.create({
      data: {
        id: f.id('film'),
        label: 'shortFilm',
        primaryLanguageId: '529',
        published: true,
        title: {
          create: {
            value: `Synthetic film ${f.journeyId}`,
            languageId: '529',
            primary: true
          }
        },
        videoEditions: { create: { name: 'base' } }
      }
    })
    await media.videoVariant.create({
      data: {
        id: f.id('variant'),
        videoId: f.id('film'),
        languageId: '529',
        slug: f.id('variant'),
        hls: 'https://stream.mux.com/synthetic.m3u8',
        duration: 60,
        published: true
      }
    })
    await f.journeys.block.create({
      data: {
        id: f.id('image'),
        journeyId: f.journeyId,
        typename: 'ImageBlock',
        parentBlockId: f.id('ac'),
        parentOrder: 2,
        alt: 'Human alt',
        scale: 140,
        settings: { untouched: true }
      }
    })
    await f.journeys.block.update({
      where: { id: f.id('video') },
      data: {
        id: f.id('video'),
        journeyId: f.journeyId,
        typename: 'VideoBlock',
        parentBlockId: f.id('bc'),
        parentOrder: 2,
        source: 'internal',
        autoplay: true,
        muted: false,
        objectFit: 'fill',
        settings: { untouched: true }
      }
    })
  })

  afterAll(async () => {
    await media.$disconnect()
    await languages.$disconnect()
  })

  it('discovers only current authorized ready library, catalog, languages, Mux and Unsplash sources', async () => {
    const result = await search('library')
    expect(result.json.result?.isError, result.text).not.toBe(true)
    expect(result.text).toContain(f.id('asset'))
    expect(result.text).toContain(f.id('team-asset'))
    expect(result.text).not.toContain(f.id('foreign-asset'))
    expect(result.text).not.toContain(f.id('unready'))
    for (const [source, more, expected] of [
      ['internal', { query: f.journeyId }, f.id('film')],
      ['languages', { videoId: f.id('film') }, '529'],
      ['mux', {}, f.id('mux')],
      ['unsplash', {}, 'synthetic-photo']
    ] as const) {
      const found = await search(source, more)
      expect(found.json.result?.isError, found.text).not.toBe(true)
      expect(found.text).toContain(expected)
    }
  })

  it('selects a ready image, preserves metadata on focal edits, and clears only the ordinary source and alt', async () => {
    const heading = await f.journeys.block.findUniqueOrThrow({
      where: { id: f.id('heading') }
    })
    await f.save([selectImage()])
    const selected = await image()
    expect(selected).toMatchObject({
      width: 1200,
      height: 800,
      alt: 'Human alt',
      scale: 140,
      settings: { untouched: true }
    })
    await f.save([
      {
        type: 'image_set',
        block: ref('image'),
        focalLeft: 0,
        focalTop: 100,
        scale: null
      }
    ])
    expect(await image()).toMatchObject({
      src: selected.src,
      width: 1200,
      height: 800,
      blurhash: readyImage.blurhash,
      focalLeft: 0,
      focalTop: 100,
      scale: null
    })
    await f.save([{ type: 'image_source_clear', block: ref('image') }])
    expect(await image()).toMatchObject({
      src: null,
      alt: '',
      deletedAt: null,
      width: 1200,
      height: 800
    })
    expect(
      await f.journeys.block.findUniqueOrThrow({ where: { id: heading.id } })
    ).toEqual(heading)
    expect(
      await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
    ).not.toBeNull()
  })

  it('saves media and presentation together with one reversible history entry', async () => {
    const before = { image: await image(), button: await image('button') }
    const saved = await f.save([
      selectImage(),
      { type: 'button_set', blockId: f.id('button'), label: 'Updated button' }
    ])
    expect(await image()).toMatchObject({
      width: readyImage.width,
      height: readyImage.height,
      blurhash: readyImage.blurhash
    })
    expect((await image()).src).not.toBeNull()
    expect(await image('button')).toMatchObject({ label: 'Updated button' })
    f.receipt(await f.historyAction('undo', saved.historyId!))
    expect(await image()).toMatchObject({ src: before.image.src })
    expect(await image('button')).toMatchObject({ label: before.button.label })
    f.receipt(await f.historyAction('redo', saved.historyId!))
    expect((await image()).src).not.toBeNull()
    expect(await image('button')).toMatchObject({ label: 'Updated button' })
  })

  it.each(['cover', 'poster', 'poll', 'logo', 'social'] as const)(
    'creates, clears, undoes and redoes a complete owned %s slot without deleting the asset',
    async (slot) => {
      if (slot === 'logo')
        await f.journeys.journey.update({
          where: { id: f.journeyId },
          data: { website: true }
        })
      const target =
        slot === 'cover'
          ? { slot, owner: ref('ac') }
          : slot === 'poster'
            ? { slot, owner: ref('video') }
            : slot === 'poll'
              ? { slot, owner: ref('yes') }
              : { slot }
      const ownerId =
        slot === 'cover'
          ? f.id('ac')
          : slot === 'poster'
            ? f.id('video')
            : slot === 'poll'
              ? f.id('yes')
              : f.journeyId
      const field = {
        cover: 'coverBlockId',
        poster: 'posterBlockId',
        poll: 'pollOptionImageBlockId',
        logo: 'logoImageBlockId',
        social: 'primaryImageBlockId'
      }[slot]
      const owner = async () =>
        slot === 'logo' || slot === 'social'
          ? f.journeys.journey.findUniqueOrThrow({ where: { id: ownerId } })
          : f.journeys.block.findUniqueOrThrow({ where: { id: ownerId } })
      await f.save([
        {
          type: 'media_slot_set',
          target,
          media: {
            kind: 'image',
            source: { source: 'library', id: f.id('asset') },
            alt: 'Owned image'
          }
        }
      ])
      const childId = (await owner())[
        field as keyof Awaited<ReturnType<typeof owner>>
      ] as string
      expect(childId).toBeTruthy()
      expect(
        await f.journeys.block.findUniqueOrThrow({ where: { id: childId } })
      ).toMatchObject({
        typename: 'ImageBlock',
        parentBlockId: slot === 'logo' || slot === 'social' ? null : ownerId,
        parentOrder: null,
        width: 1200
      })
      const cleared = await f.save([{ type: 'media_slot_clear', target }])
      expect(
        (await owner())[field as keyof Awaited<ReturnType<typeof owner>>]
      ).toBeNull()
      expect(
        (await f.journeys.block.findUniqueOrThrow({ where: { id: childId } }))
          .deletedAt
      ).not.toBeNull()
      f.receipt(await f.historyAction('undo', cleared.historyId!))
      expect(
        (await owner())[field as keyof Awaited<ReturnType<typeof owner>>]
      ).toBe(childId)
      f.receipt(await f.historyAction('redo', cleared.historyId!))
      expect(
        (await owner())[field as keyof Awaited<ReturnType<typeof owner>>]
      ).toBeNull()
      expect(
        await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
      ).not.toBeNull()
    }
  )

  it.each(['internal', 'youTube', 'mux'])(
    'selects and configures ready %s video without changing its ID or adjacent content',
    async (source) => {
      const value =
        source === 'internal'
          ? { source, videoId: f.id('film'), languageId: '529' }
          : { source, videoId: source === 'mux' ? f.id('mux') : 'abcdefghijk' }
      await f.save([
        { type: 'video_source_set', block: ref('video'), source: value }
      ])
      await f.save([
        {
          type: 'video_settings_set',
          block: ref('video'),
          startAt: 2,
          endAt: 5,
          objectFit: source === 'youTube' ? 'fit' : 'zoomed',
          autoplay: false,
          muted: true
        }
      ])
      expect(await image('video')).toMatchObject({
        id: f.id('video'),
        source,
        startAt: 2,
        endAt: 5,
        autoplay: false,
        muted: true,
        settings: { untouched: true },
        videoVariantLanguageId: source === 'internal' ? '529' : null
      })
    }
  )

  it('configures source-specific subtitle fields together and preserves poster references', async () => {
    await f.save([selectVideo()])
    await f.save([
      {
        type: 'media_slot_set',
        target: { slot: 'poster', owner: ref('video') },
        media: {
          kind: 'image',
          source: { source: 'unsplash', id: 'synthetic-photo' }
        }
      }
    ])
    const poster = (await image('video')).posterBlockId
    await f.save([
      {
        type: 'video_settings_set',
        block: ref('video'),
        showGeneratedSubtitles: true,
        subtitleLanguageId: '529'
      }
    ])
    expect(await image('video')).toMatchObject({
      showGeneratedSubtitles: true,
      subtitleLanguageId: '529',
      posterBlockId: poster
    })
    await reject([
      {
        type: 'video_settings_set',
        block: ref('video'),
        showGeneratedSubtitles: false
      }
    ])
    await reject([
      {
        type: 'video_settings_set',
        block: ref('video'),
        showGeneratedSubtitles: true,
        subtitleLanguageId: '21028'
      }
    ])
  })

  it('selects a source and playback limits atomically, and keeps video usable when caption authorization is unavailable', async () => {
    captionsUnavailable = true
    await f.save([
      {
        ...selectVideo({ source: 'youTube', videoId: 'abcdefghijk' }),
        settings: { startAt: 3, endAt: 8, muted: true, autoplay: false }
      }
    ])
    expect(await image('video')).toMatchObject({
      videoId: 'abcdefghijk',
      startAt: 3,
      endAt: 8,
      muted: true,
      autoplay: false,
      objectFit: 'fit'
    })
    const found = await search('youTube', { videoId: 'abcdefghijk' })
    expect(found.json.result?.isError, found.text).not.toBe(true)
    expect(found.text).toContain('unavailable')
    await f.save([
      { type: 'video_settings_set', block: ref('video'), endAt: 10 }
    ])
    await reject([
      {
        type: 'video_settings_set',
        block: ref('video'),
        subtitleLanguageId: '529'
      }
    ])
  })

  it('rejects media children referenced by a foreign journey without changing either owner', async () => {
    await f.save([selectImage()])
    await f.journeys.journey.create({
      data: {
        id: f.id('foreign-journey'),
        title: 'Synthetic foreign draft',
        status: 'draft',
        slug: f.id('foreign-journey'),
        languageId: '529',
        teamId: 'structure-team-alice',
        blocks: {
          create: {
            id: f.id('foreign-ac'),
            typename: 'CardBlock',
            coverBlockId: f.id('image')
          }
        }
      }
    })
    const foreign = await f.journeys.block.findUniqueOrThrow({
      where: { id: f.id('foreign-ac') }
    })
    await reject([{ type: 'image_set', block: ref('image'), focalLeft: 10 }])
    expect(
      await f.journeys.block.findUniqueOrThrow({ where: { id: foreign.id } })
    ).toEqual(foreign)
  })

  it('clears an ordinary Video and its owned poster as one reversible edit while retaining settings and provider assets', async () => {
    await f.save([selectVideo()])
    await f.save([
      {
        type: 'media_slot_set',
        target: { slot: 'poster', owner: ref('video') },
        media: {
          kind: 'image',
          source: { source: 'library', id: f.id('asset') }
        }
      }
    ])
    const before = await image('video'),
      poster = before.posterBlockId!
    const saved = await f.save([
      { type: 'video_source_clear', block: ref('video') }
    ])
    expect(await image('video')).toMatchObject({
      id: before.id,
      videoId: null,
      videoVariantLanguageId: null,
      source: 'internal',
      startAt: null,
      endAt: null,
      posterBlockId: null,
      autoplay: before.autoplay,
      muted: before.muted,
      settings: before.settings,
      deletedAt: null
    })
    expect(
      (await f.journeys.block.findUniqueOrThrow({ where: { id: poster } }))
        .deletedAt
    ).not.toBeNull()
    f.receipt(await f.historyAction('undo', saved.historyId!))
    expect(await image('video')).toMatchObject({
      videoId: before.videoId,
      posterBlockId: poster,
      startAt: before.startAt,
      endAt: before.endAt
    })
    f.receipt(await f.historyAction('redo', saved.historyId!))
    expect(
      await media.muxVideo.findUnique({ where: { id: before.videoId! } })
    ).not.toBeNull()
    expect(
      await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
    ).not.toBeNull()
  })

  it('authorizes copied media and rejects duplication of a revoked nested source', async () => {
    await f.save([selectImage()])
    const saved = await f.save([
      {
        type: 'block_duplicate',
        key: 'image_copy',
        source: ref('image'),
        placement: { position: 'end' }
      }
    ])
    expect(
      await f.journeys.block.findUniqueOrThrow({
        where: { id: saved.idMap.image_copy }
      })
    ).toMatchObject({ src: (await image()).src, width: 1200, height: 800 })
    await settleMedia()
    await protectedMedia.cloudflareImage.update({
      where: { id: f.id('asset') },
      data: { uploaded: false }
    })
    await reject([
      {
        type: 'block_duplicate',
        key: 'revoked_copy',
        source: ref('image'),
        placement: { position: 'end' }
      }
    ])
  })

  it.each([
    { type: 'block_duplicate', forward: false },
    { type: 'block_duplicate', forward: true },
    { type: 'step_duplicate', forward: false },
    { type: 'step_duplicate', forward: true }
  ] as const)(
    'chains $type with forward references $forward, replay and reversible media ownership',
    async ({ type, forward }) => {
      await f.save([
        selectImage(),
        {
          type: 'media_slot_set',
          target: { slot: 'cover', owner: ref('ac') },
          media: {
            kind: 'image',
            source: { source: 'library', id: f.id('asset') }
          }
        }
      ])
      const original = await image()
      const originalCard = await image('ac')
      const commands = ['copy1', 'copy2', 'copy3'].map((key, index) => ({
        type,
        source:
          index === 0
            ? ref(type === 'block_duplicate' ? 'image' : 'a')
            : { local: `copy${index}` },
        key,
        placement: { position: 'end' }
      }))
      const input = await f.input(forward ? commands.reverse() : commands)
      const saved = f.receipt(await f.edit(input))
      const committed = await f.snapshot()
      expect(f.receipt(await f.edit(input))).toEqual(saved)
      expect(await f.snapshot()).toEqual(committed)
      const copiedIds: string[] = []
      let sourceImageId = original.id
      let sourceCardId = originalCard.id
      let sourceCoverId = originalCard.coverBlockId!
      for (const key of ['copy1', 'copy2', 'copy3']) {
        const mapping = new Map(
          saved.duplicateMaps![key].map(({ sourceId, blockId }) => [
            sourceId,
            blockId
          ])
        )
        sourceImageId = mapping.get(sourceImageId)!
        expect(sourceImageId).toBeDefined()
        const copy = await f.journeys.block.findUniqueOrThrow({
          where: { id: sourceImageId }
        })
        copiedIds.push(copy.id)
        if (type === 'step_duplicate') {
          sourceCardId = mapping.get(sourceCardId)!
          sourceCoverId = mapping.get(sourceCoverId)!
          const card = await f.journeys.block.findUniqueOrThrow({
            where: { id: sourceCardId }
          })
          expect(card.coverBlockId).toBe(sourceCoverId)
          expect(
            await f.journeys.block.findUniqueOrThrow({
              where: { id: sourceCoverId }
            })
          ).toMatchObject({
            parentBlockId: sourceCardId,
            parentOrder: null,
            src: original.src,
            width: readyImage.width,
            height: readyImage.height,
            blurhash: readyImage.blurhash
          })
          copiedIds.push(sourceCoverId)
        }
        expect(copy).toMatchObject({
          parentBlockId: sourceCardId,
          src: original.src,
          width: original.width,
          height: original.height,
          blurhash: original.blurhash,
          alt: original.alt,
          scale: original.scale,
          settings: original.settings
        })
      }
      expect(new Set(copiedIds).size).toBe(copiedIds.length)
      expect(copiedIds).not.toContain(original.id)
      expect(copiedIds).not.toContain(originalCard.coverBlockId)
      expect(await image()).toEqual(original)
      f.receipt(await f.historyAction('undo', saved.historyId!))
      for (const id of copiedIds)
        expect(
          (await f.journeys.block.findUniqueOrThrow({ where: { id } }))
            .deletedAt
        ).not.toBeNull()
      f.receipt(await f.historyAction('redo', saved.historyId!))
      for (const id of copiedIds)
        expect(
          await f.journeys.block.findUniqueOrThrow({ where: { id } })
        ).toMatchObject({ deletedAt: null, src: original.src })
      await settleMedia()
      await protectedMedia.cloudflareImage.update({
        where: { id: f.id('asset') },
        data: { uploaded: false }
      })
      await reject(commands)
      expect(await image()).toEqual(original)
      expect(
        await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
      ).not.toBeNull()
    }
  )

  it('copies an authorized media subtree with fresh owned references and rejects a revoked nested rendition', async () => {
    await f.save([
      selectVideo(),
      ...(['cover', 'poster'] as const).map((slot) => ({
        type: 'media_slot_set',
        target: { slot, owner: ref(slot === 'cover' ? 'bc' : 'video') },
        media: {
          kind: 'image',
          source: { source: 'library', id: f.id('asset') }
        }
      }))
    ])
    const before = await image('video')
    const saved = await f.save([
      {
        type: 'step_duplicate',
        source: ref('b'),
        key: 'media_copy',
        placement: { position: 'end' }
      }
    ])
    const map = saved.duplicateIdMap!
    expect(
      await f.journeys.block.findUniqueOrThrow({
        where: { id: map[f.id('video')] }
      })
    ).toMatchObject({
      videoId: before.videoId,
      parentBlockId: map[f.id('bc')],
      posterBlockId: map[before.posterBlockId!]
    })
    expect(await image('video')).toEqual(before)
    await settleMedia()
    await protectedMedia.muxVideo.update({
      where: { id: f.id('mux') },
      data: { readyToStream: false }
    })
    await reject([
      {
        type: 'step_duplicate',
        source: ref('b'),
        key: 'revoked_step',
        placement: { position: 'end' }
      }
    ])
  })

  it('enforces background video autoplay, mute, subtitles and fullscreen layout', async () => {
    await f.save([
      {
        type: 'media_slot_set',
        target: { slot: 'cover', owner: ref('ac') },
        media: {
          kind: 'video',
          source: { source: 'mux', videoId: f.id('mux') }
        }
      }
    ])
    const cover = (
      await f.journeys.block.findUniqueOrThrow({ where: { id: f.id('ac') } })
    ).coverBlockId!
    expect(
      await f.journeys.block.findUniqueOrThrow({ where: { id: cover } })
    ).toMatchObject({ parentOrder: null, muted: true, autoplay: true })
    for (const patch of [
      { muted: false },
      { autoplay: false },
      { showGeneratedSubtitles: true, subtitleLanguageId: '529' }
    ])
      await reject([
        { type: 'video_settings_set', block: { id: cover }, ...patch }
      ])
    await f.journeys.block.update({
      where: { id: f.id('ac') },
      data: { fullscreen: false }
    })
    await reject([
      { type: 'video_settings_set', block: { id: cover }, startAt: 1 }
    ])
  })

  it.each(['foreign-asset', 'unready', 'missing'])(
    'rejects an inaccessible or unready %s without partial changes',
    async (suffix) => {
      await reject([
        {
          type: 'typography_set',
          blockId: f.id('heading'),
          content: 'Must not commit'
        },
        selectImage(f.id(suffix))
      ])
    }
  )

  it('rejects foreign nested history IDs and user-forged source metadata or URLs', async () => {
    await reject([
      {
        type: 'image_set',
        block: ref('image'),
        source: { source: 'history', blockId: 'foreign-block' }
      }
    ])
    for (const source of [
      { source: 'library', id: f.id('asset'), width: 1 },
      { source: 'existingImage', blockId: f.id('image') },
      { source: 'url', url: 'http://169.254.169.254/latest/meta-data' },
      { source: 'unsplash', id: 'https://127.0.0.1' }
    ])
      await reject([{ type: 'image_set', block: ref('image'), source }])
    await reject([
      {
        type: 'video_source_set',
        block: ref('video'),
        source: { source: 'cloudflare', videoId: 'unsupported' }
      }
    ])
  })

  it('rejects disabled library and logo controls through direct invocation', async () => {
    flags.mediaLibrary = false
    expect((await search('library')).json.result?.isError).toBe(true)
    await reject([selectImage()])
    await reject([selectVideo()])
    await f.save([
      {
        type: 'image_set',
        block: ref('image'),
        source: { source: 'unsplash', id: 'synthetic-photo' }
      }
    ])
    await f.save([{ type: 'image_set', block: ref('image'), focalLeft: 25 }])
    const cleared = await f.save([
      { type: 'image_source_clear', block: ref('image') }
    ])
    f.receipt(await f.historyAction('undo', cleared.historyId!))
    expect((await image()).src).toBe(
      'https://images.unsplash.com/synthetic-photo'
    )
    f.receipt(await f.historyAction('redo', cleared.historyId!))
    expect((await image()).src).toBeNull()
    expect((await search('history')).json.result?.isError).toBe(true)
    f.receipt(await f.historyAction('undo', cleared.historyId!))
    const copied = await f.save([
      {
        type: 'block_duplicate',
        source: ref('image'),
        key: 'copy_unsplash',
        placement: { position: 'end' }
      }
    ])
    expect(
      await f.journeys.block.findUniqueOrThrow({
        where: { id: copied.idMap.copy_unsplash }
      })
    ).toMatchObject({ src: 'https://images.unsplash.com/synthetic-photo' })
    flags.websiteMode = false
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: { website: true }
    })
    await reject([
      {
        type: 'media_slot_set',
        target: { slot: 'logo' },
        media: {
          kind: 'image',
          source: { source: 'unsplash', id: 'synthetic-photo' }
        }
      }
    ])
  })

  it('denies view-only grants, removed Admin rights, stale revisions and published writes', async () => {
    const view = await f.consent('view')
    expect(
      (await f.edit(await f.input([selectImage()]), view)).json.result?.isError
    ).toBe(true)
    const stale = await f.input([selectImage()])
    await f.journeys.block.update({
      where: { id: f.id('heading') },
      data: { content: 'Human changed this' }
    })
    expect((await f.edit(stale)).text).toContain('REVISION_CONFLICT')
    await f.journeys.userTeam.deleteMany({ where: { userId: 'alice' } })
    await reject([selectImage()])
    expect((await search('internal')).json.result?.isError).toBe(true)
    await f.journeys.userTeam.create({
      data: { teamId: 'structure-team-alice', userId: 'alice', role: 'manager' }
    })
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        firstPublishedAt: new Date()
      }
    })
    await reject([selectImage()])
  })

  it('rejects video attachment in an expanded Card', async () => {
    await f.journeys.block.update({
      where: { id: f.id('bc') },
      data: { fullscreen: false }
    })
    await reject([selectVideo()])
  })

  it('rejects invalid timing, rendition and source-specific fit combinations', async () => {
    await f.save([selectVideo()])
    for (const patch of [
      { startAt: 118 },
      { startAt: 3, endAt: 5 },
      { endAt: 121 },
      { startAt: -1 }
    ])
      await reject([
        { type: 'video_settings_set', block: ref('video'), ...patch }
      ])
    await reject([
      {
        type: 'video_source_set',
        block: ref('video'),
        source: {
          source: 'internal',
          videoId: f.id('film'),
          languageId: '21028'
        }
      }
    ])
    await f.save([
      {
        type: 'video_source_set',
        block: ref('video'),
        source: { source: 'youTube', videoId: 'abcdefghijk' }
      }
    ])
    await reject([
      { type: 'video_settings_set', block: ref('video'), objectFit: 'fill' }
    ])
  })

  it('redacts provider failures and leaves content, receipts, history and assets intact', async () => {
    providerFailure = true
    await reject([selectImage()])
    const result = await search('unsplash')
    expect(result.json.result?.isError).toBe(true)
    expect(result.text).not.toContain('credential-sentinel')
    expect(
      await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
    ).not.toBeNull()
  })

  it('replays a lost attachment and button edit once, rejects changed key reuse and preserves unrelated human edits through undo and redo', async () => {
    const button = renameButton()
    const readButton = () =>
      f.journeys.block.findUniqueOrThrow({ where: { id: button.blockId } })
    const originalLabel = (await readButton()).label
    const input = await f.input([selectImage(), button])
    f.loseNextResponse()
    expect((await f.edit(input)).json.result?.isError).toBe(true)
    const saved = f.receipt(await f.edit(input))
    expect(await f.counts()).toEqual({ operations: 1, history: 1, effects: 1 })
    expect((await image()).src).toContain(f.id('asset'))
    expect((await readButton()).label).toBe(button.label)
    expect(
      (
        await f.edit({
          ...input,
          commands: [selectImage(f.id('team-asset')), button]
        })
      ).text
    ).toContain('IDEMPOTENCY_KEY_REUSED')
    await f.journeys.block.update({
      where: { id: f.id('heading') },
      data: { content: 'New human heading' }
    })
    f.receipt(await f.historyAction('undo', saved.historyId!))
    expect((await image()).src).toBeNull()
    expect((await readButton()).label).toBe(originalLabel)
    expect(
      (
        await f.journeys.block.findUniqueOrThrow({
          where: { id: f.id('heading') }
        })
      ).content
    ).toBe('New human heading')
    f.receipt(await f.historyAction('redo', saved.historyId!))
    expect((await image()).src).toContain(f.id('asset'))
    expect((await readButton()).label).toBe(button.label)
  })

  it.each([
    {
      slot: 'social',
      field: 'primaryImageBlockId',
      laterField: 'logoImageBlockId'
    },
    {
      slot: 'logo',
      field: 'logoImageBlockId',
      laterField: 'primaryImageBlockId'
    }
  ] as const)(
    'protects a later Journey image reference when undoing creation of the $slot image',
    async ({ slot, field, laterField }) => {
      const where = { id: f.journeyId }
      await f.journeys.journey.update({ where, data: { website: true } })
      const saved = await f.save([
        {
          type: 'media_slot_set',
          target: { slot },
          media: {
            kind: 'image',
            source: { source: 'library', id: f.id('asset') }
          }
        }
      ])
      const imageId = (await f.journeys.journey.findUniqueOrThrow({ where }))[
        field
      ]!
      expect(imageId).toEqual(expect.any(String))
      await f.journeys.journey.update({
        where,
        data: { [laterField]: imageId }
      })
      const before = await f.snapshot()
      expect((await f.historyAction('undo', saved.historyId!)).text).toContain(
        'HISTORY_CONFLICT'
      )
      expect(await f.snapshot()).toEqual(before)

      await f.journeys.journey.update({ where, data: { [laterField]: null } })
      f.receipt(await f.historyAction('undo', saved.historyId!))
      expect(
        (await f.journeys.journey.findUniqueOrThrow({ where }))[field]
      ).toBeNull()
      expect(
        (await f.journeys.block.findUniqueOrThrow({ where: { id: imageId } }))
          .deletedAt
      ).not.toBeNull()
    }
  )

  it('rejects history conflicts and a source revoked before redo without deleting provider assets', async () => {
    const saved = await f.save([selectImage()])
    await f.journeys.block.update({
      where: { id: f.id('image') },
      data: { src: 'https://images.unsplash.com/human-change' }
    })
    expect((await f.historyAction('undo', saved.historyId!)).text).toContain(
      'HISTORY_CONFLICT'
    )
    await f.journeys.block.update({
      where: { id: f.id('image') },
      data: {
        src: `https://imagedelivery.net/synthetic-account/${f.id('asset')}/public`
      }
    })
    f.receipt(await f.historyAction('undo', saved.historyId!))
    await settleMedia()
    await protectedMedia.cloudflareImage.update({
      where: { id: f.id('asset') },
      data: { uploaded: false }
    })
    const before = await f.snapshot()
    expect(
      (await f.historyAction('redo', saved.historyId!)).json.result?.isError
    ).toBe(true)
    expect(await f.snapshot()).toEqual(before)
  })

  it('binds discovery pagination to identity, filters, journey revision and source generation', async () => {
    const first = await search('library', { limit: 1 })
    const cursor = first.json.result?.structuredContent?.nextCursor
    expect(cursor).toBeTruthy()
    expect(
      (await search('library', { limit: 1, cursor })).json.result?.isError
    ).not.toBe(true)
    expect(
      (await search('mux', { limit: 1, cursor })).json.result?.isError
    ).toBe(true)
    await settleMedia()
    await protectedMedia.cloudflareImage.update({
      where: { id: f.id('asset') },
      data: { blurhash: 'changed' }
    })
    expect(
      (await search('library', { limit: 1, cursor })).json.result?.isError
    ).toBe(true)
  })

  it('cancels a prepared attachment and its batched button edit when a source changes before acceptance', async () => {
    let changed = false
    f.checkpoint = async (point) => {
      if (point === 'before_accept' && !changed) {
        changed = true
        await protectedMedia.cloudflareImage.delete({
          where: { id: f.id('asset') }
        })
      }
    }
    await reject([renameButton(), selectImage()])
    expect(changed).toBe(true)
  })

  it('keeps source withdrawal pending until an accepted attachment settles, then safely completes the source write', async () => {
    let ready!: () => void, resume!: () => void
    const paused = new Promise<void>((resolve) => {
        ready = resolve
      }),
      continuation = new Promise<void>((resolve) => {
        resume = resolve
      })
    f.checkpoint = async (point) => {
      if (point === 'after_accept') {
        ready()
        await continuation
      }
    }
    const input = await f.input([selectImage()])
    const attaching = f.edit(input)
    await paused
    try {
      await expect(
        protectedMedia.cloudflareImage.delete({ where: { id: f.id('asset') } })
      ).rejects.toThrow('pending accepted work')
      expect(
        await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
      ).not.toBeNull()
      await guard.recover()
    } finally {
      resume()
    }
    await attaching
    expect((await image()).src).toContain(f.id('asset'))
    f.checkpoint = undefined
    await settleMedia()
    await protectedMedia.cloudflareImage.delete({
      where: { id: f.id('asset') }
    })
    f.receipt(await f.edit(input))
    expect(await f.counts()).toEqual({ operations: 1, history: 1, effects: 1 })
  })

  it('revalidates history sources, YouTube subtitles and website fit', async () => {
    await f.save([selectImage()])
    const found = await search('history')
    expect(found.json.result?.isError, found.text).not.toBe(true)
    expect(found.text).toContain(f.id('image'))
    await f.save([
      {
        type: 'media_slot_set',
        target: { slot: 'social' },
        media: {
          kind: 'image',
          source: { source: 'history', blockId: f.id('image') }
        }
      }
    ])
    const youtube = await search('youTube', { videoId: 'abcdefghijk' })
    expect(youtube.text).toContain('Trusted provider description')
    await f.save([
      {
        type: 'video_source_set',
        block: ref('video'),
        source: { source: 'youTube', videoId: 'abcdefghijk' }
      }
    ])
    await f.save([
      {
        type: 'video_settings_set',
        block: ref('video'),
        subtitleLanguageId: '529'
      }
    ])
    expect(await image('video')).toMatchObject({
      subtitleLanguageId: '529',
      objectFit: 'fit'
    })
    await f.journeys.journey.update({
      where: { id: f.journeyId },
      data: { website: true }
    })
    await f.save([selectVideo()])
    await reject([
      { type: 'video_settings_set', block: ref('video'), objectFit: 'zoomed' }
    ])
  })

  it('rejects revoked or invalid sources and rolls back an interrupted attachment', async () => {
    await media.video.update({
      where: { id: f.id('film') },
      data: { restrictViewPlatforms: ['watch'] }
    })
    await reject([
      {
        type: 'video_source_set',
        block: ref('video'),
        source: { source: 'internal', videoId: f.id('film'), languageId: '529' }
      }
    ])
    await media.muxVideo.update({
      where: { id: f.id('mux') },
      data: { readyToStream: false }
    })
    await reject([selectVideo()])
    await media.video.update({
      where: { id: f.id('film') },
      data: { restrictViewPlatforms: [] }
    })
    await media.videoVariant.update({
      where: { id: f.id('variant') },
      data: { hls: 'http://169.254.169.254/private.m3u8' }
    })
    await reject([
      {
        type: 'video_source_set',
        block: ref('video'),
        source: { source: 'internal', videoId: f.id('film'), languageId: '529' }
      }
    ])
    f.checkpoint = async (point) => {
      if (point === 'after_content')
        throw new Error('controlled transaction interruption')
    }
    await reject([selectImage()])
    expect(await f.counts()).toEqual({ operations: 0, history: 0, effects: 0 })
  })

  it('rejects overlapping media writes and disables recorded media inverses when its participant is disabled', async () => {
    await reject([
      { type: 'image_set', block: ref('image'), focalLeft: 10 },
      { type: 'image_set', block: ref('image'), focalLeft: 20 }
    ])
    const saved = await f.save([selectImage()])
    const config = f.ownerConfig.media
    try {
      f.ownerConfig.media = undefined
      await reject([{ type: 'image_set', block: ref('image'), focalLeft: 20 }])
      await reject([
        {
          type: 'block_duplicate',
          source: ref('image'),
          key: 'blocked_copy',
          placement: { position: 'end' }
        }
      ])
      expect(
        (await f.historyAction('undo', saved.historyId!)).json.result?.isError
      ).toBe(true)
    } finally {
      f.ownerConfig.media = config
    }
    const removed = await f.save([
      { type: 'block_remove', block: ref('image') }
    ])
    const beforeUndo = await f.snapshot()
    try {
      f.ownerConfig.media = undefined
      expect(
        (await f.historyAction('undo', removed.historyId!)).json.result?.isError
      ).toBe(true)
      expect(await f.snapshot()).toEqual(beforeUndo)
    } finally {
      f.ownerConfig.media = config
    }
    f.receipt(await f.historyAction('undo', removed.historyId!))
    expect((await image()).deletedAt).toBeNull()
  })

  it.each([
    { external: false, loseOwner: false },
    { external: true, loseOwner: false },
    { external: false, loseOwner: true },
    { external: true, loseOwner: true }
  ])(
    'preserves live source work and fences abandoned work across workers, external=$external, loseOwner=$loseOwner',
    async ({ external, loseOwner }) => {
      const worker = new MediaDatabase({
        adapter: new PrismaPg({ connectionString: mediaUrl })
      })
      const recovery = createMediaMutationGuard(
        {
          authorityUrl: f.ownerConfig.authorityUrl,
          authoritySecret: mutationSecret
        },
        worker
      )
      let ready!: () => void, resume!: () => void
      const paused = new Promise<void>((resolve) => {
        ready = resolve
      })
      const continuation = new Promise<void>((resolve) => {
        resume = resolve
      })
      const originalFetch = globalThis.fetch
      let changeId: string | undefined
      vi.stubGlobal(
        'fetch',
        async (input: string | URL | Request, options?: RequestInit) => {
          const url = input instanceof Request ? input.url : String(input)
          if (url.endsWith('/internal/permissions/begin') && !changeId) {
            if (typeof options?.body !== 'string')
              throw new Error('Expected JSON authority request')
            changeId = JSON.parse(options.body).changeId
            const response = await originalFetch(input, options)
            ready()
            await continuation
            return response
          }
          return originalFetch(input, options)
        }
      )
      let dispatches = 0
      const deleting = guard.run(
        { delete: f.id('asset'), external },
        async () => {
          dispatches++
          await protectedMedia.cloudflareImage.delete({
            where: { id: f.id('asset') }
          })
          return true
        },
        external
      )
      // Attach a handler before checking the paused executor's receipt.
      const outcome = deleting.then(
        (value) => ({ value, error: undefined }),
        (error: unknown) => ({ value: undefined, error })
      )
      try {
        await paused
        await recovery.recover()
        expect(
          await worker.mcpMediaMutation.findUniqueOrThrow({
            where: { id: changeId }
          })
        ).toMatchObject({
          status: external ? 'prepared_external' : 'prepared',
          reportedAt: null
        })
        expect(dispatches).toBe(0)
        await expect(
          recovery.run({ other: f.id('asset') }, async () => {
            throw new Error('competing source write must not dispatch')
          })
        ).rejects.toThrow('pending accepted work')
        if (loseOwner) {
          // Kill only the ownership session in this issue's isolated database.
          // The executor remains paused, so recovery must positively fence it.
          const terminated = await worker.$queryRaw<{ terminated: boolean }[]>`
            SELECT pg_terminate_backend(pid) AS terminated
            FROM pg_locks
            WHERE locktype = 'advisory' AND granted AND objsubid = 1
              AND database = (SELECT oid FROM pg_database WHERE datname = current_database())
              AND classid = ((hashtextextended('media:sources:executor', 0) >> 32) & 4294967295)::oid
              AND objid = (hashtextextended('media:sources:executor', 0) & 4294967295)::oid
          `
          expect(terminated).toEqual([{ terminated: true }])
          await recovery.recover()
          expect(
            await worker.mcpMediaMutation.findUniqueOrThrow({
              where: { id: changeId }
            })
          ).toMatchObject({
            status: 'fenced',
            completedAt: expect.any(Date),
            reportedAt: expect.any(Date)
          })
        }
      } finally {
        resume()
        await outcome
        vi.unstubAllGlobals()
        await worker.$disconnect()
      }
      if (loseOwner) {
        expect((await outcome).error).toBeDefined()
        expect(dispatches).toBe(0)
        expect(
          await media.cloudflareImage.findUnique({
            where: { id: f.id('asset') }
          })
        ).not.toBeNull()
        await guard.run(
          { delete: f.id('asset'), external },
          async () => {
            await protectedMedia.cloudflareImage.delete({
              where: { id: f.id('asset') }
            })
          },
          external
        )
      } else {
        expect(await outcome).toEqual({ value: true, error: undefined })
        expect(dispatches).toBe(1)
      }
      expect(
        await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
      ).toBeNull()
      expect((await search('library')).json.result?.isError).not.toBe(true)
    }
  )

  it('fences failed SQL writes and recovers a lost source-change completion report', async () => {
    await expect(
      protectedMedia.muxVideo.update({
        where: { id: 'missing-source' },
        data: { duration: 1 }
      })
    ).rejects.toThrow()
    expect((await search('library')).json.result?.isError).not.toBe(true)
    await settleMedia()
    const originalFetch = globalThis.fetch
    vi.stubGlobal(
      'fetch',
      async (input: string | URL | Request, options?: RequestInit) => {
        const url =
          input instanceof Request
            ? input.url
            : input instanceof URL
              ? input.href
              : input
        if (url.endsWith('/internal/permissions/complete'))
          return Response.json(
            { error: 'controlled report failure' },
            { status: 503 }
          )
        return originalFetch(input, options)
      }
    )
    try {
      await expect(
        protectedMedia.cloudflareImage.update({
          where: { id: f.id('asset') },
          data: { blurhash: 'committed-once' }
        })
      ).rejects.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
    expect(
      (
        await media.cloudflareImage.findUniqueOrThrow({
          where: { id: f.id('asset') }
        })
      ).blurhash
    ).toBe('committed-once')
    await guard.recover()
    expect((await search('library')).json.result?.isError).not.toBe(true)
    expect(
      await media.mcpMediaMutation.count({
        where: { status: 'committed', reportedAt: null }
      })
    ).toBe(0)
  })

  it('rejects a stale second delete without provider dispatch or stranding the source gate', async () => {
    const schema = buildSchema(
      'type Query { ping: Boolean } type Mutation { deleteMuxVideo(id: ID!): Boolean! }'
    )
    let dispatches = 0
    schema.getMutationType()!.getFields().deleteMuxVideo.resolve = async (
      _parent: unknown,
      args: { id: string }
    ) => {
      await protectedMedia.muxVideo.findUniqueOrThrow({
        where: { id: args.id, userId: 'alice' }
      })
      dispatches++
      await protectedMedia.muxVideo.delete({ where: { id: args.id } })
      return true
    }
    guard.plugin.onSchemaChange!({ schema } as Parameters<
      NonNullable<typeof guard.plugin.onSchemaChange>
    >[0])
    const remove = () =>
      graphql({
        schema,
        source: 'mutation($id: ID!) { deleteMuxVideo(id: $id) }',
        variableValues: { id: f.id('mux') },
        contextValue: { user: { id: 'alice' }, currentRoles: [] }
      })
    let ready!: () => void, resume!: () => void
    const paused = new Promise<void>((resolve) => {
      ready = resolve
    })
    const continuation = new Promise<void>((resolve) => {
      resume = resolve
    })
    const findSource = media.muxVideo.findFirst.bind(media.muxVideo)
    const lookup = vi
      .spyOn(media.muxVideo, 'findFirst')
      .mockImplementationOnce(async (args) => {
        const source = await findSource(args)
        ready()
        await continuation
        return source
      })
    const stale = remove()
    try {
      await paused
      expect((await remove()).errors).toBeUndefined()
      expect(dispatches).toBe(1)
      expect(
        await media.muxVideo.findUnique({ where: { id: f.id('mux') } })
      ).toBeNull()
    } finally {
      resume()
      await stale
      lookup.mockRestore()
    }
    expect((await stale).errors).toBeDefined()
    expect(dispatches).toBe(1)
    await guard.recover()
    expect(
      await media.mcpMediaMutation.count({
        where: { status: 'external', reportedAt: null }
      })
    ).toBe(0)
    expect((await search('library')).json.result?.isError).not.toBe(true)
    await protectedMedia.cloudflareImage.update({
      where: { id: f.id('asset') },
      data: { blurhash: 'gate-reopened' }
    })
    expect(
      await media.cloudflareImage.findUniqueOrThrow({
        where: { id: f.id('asset') }
      })
    ).toMatchObject({ blurhash: 'gate-reopened' })
  })

  it('keeps uncertain external deletion closed and resumes its explicit authorized retry', async () => {
    const schema = buildSchema(
      'type Query { ping: Boolean } type Mutation { deleteCloudflareImage(id: ID!): Boolean! }'
    )
    let uncertain = true
    schema.getMutationType()!.getFields().deleteCloudflareImage.resolve =
      async (_parent: unknown, args: { id: string }) => {
        if (uncertain) throw new Error('controlled provider outcome unknown')
        await protectedMedia.cloudflareImage.delete({ where: { id: args.id } })
        return true
      }
    guard.plugin.onSchemaChange!({ schema } as Parameters<
      NonNullable<typeof guard.plugin.onSchemaChange>
    >[0])
    const remove = () =>
      graphql({
        schema,
        source: 'mutation($id: ID!) { deleteCloudflareImage(id: $id) }',
        variableValues: { id: f.id('asset') },
        contextValue: { user: { id: 'alice' }, currentRoles: [] }
      })
    expect((await remove()).errors).toBeDefined()
    await guard.recover()
    expect((await search('library')).json.result?.isError).toBe(true)
    expect(
      await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
    ).not.toBeNull()
    uncertain = false
    expect((await remove()).errors).toBeUndefined()
    expect(
      await media.cloudflareImage.findUnique({ where: { id: f.id('asset') } })
    ).toBeNull()
    expect((await search('library')).json.result?.isError).not.toBe(true)
  })

  it.each(['videoDelete', 'videoVariantDelete'] as const)(
    'drains accepted attachments before dispatching %s provider effects',
    async (name) => {
      const schema = buildSchema(
        `type Query { ping: Boolean } type Mutation { ${name}(id: ID!): Boolean! }`
      )
      let dispatches = 0
      schema.getMutationType()!.getFields()[name].resolve = () => {
        dispatches++
        return true
      }
      guard.plugin.onSchemaChange!({ schema } as Parameters<
        NonNullable<typeof guard.plugin.onSchemaChange>
      >[0])
      const remove = () =>
        graphql({
          schema,
          source: `mutation($id: ID!) { ${name}(id: $id) }`,
          variableValues: {
            id: f.id(name === 'videoDelete' ? 'film' : 'variant')
          },
          contextValue: { user: { id: 'alice' }, currentRoles: ['publisher'] }
        })
      let ready!: () => void, resume!: () => void
      const paused = new Promise<void>((resolve) => {
        ready = resolve
      })
      const continuation = new Promise<void>((resolve) => {
        resume = resolve
      })
      f.checkpoint = async (point) => {
        if (point === 'after_accept') {
          ready()
          await continuation
        }
      }
      const input = await f.input([selectVideo()])
      const attaching = f.edit(input)
      await paused
      try {
        const blocked = await remove()
        expect(blocked.errors?.[0].message).toContain('pending accepted work')
        expect(dispatches).toBe(0)
        await guard.recover()
        expect(
          await media.mcpMediaMutation.findUniqueOrThrow({
            where: { id: String(blocked.errors![0].extensions.changeId) }
          })
        ).toMatchObject({ status: 'fenced', reportedAt: null })
        expect(dispatches).toBe(0)
      } finally {
        resume()
      }
      expect((await attaching).json.error).toBeDefined()
      expect(await image('video')).toMatchObject({ videoId: f.id('mux') })
      f.checkpoint = undefined
      await settleMedia()
      expect((await remove()).errors).toBeUndefined()
      expect(dispatches).toBe(1)
      f.receipt(await f.edit(input))
      expect(await f.counts()).toEqual({
        operations: 1,
        history: 1,
        effects: 1
      })
    }
  )

  it('keeps source transactions atomic and reopens admission only after their owning outcome is recorded', async () => {
    await expect(
      sourceTransaction(protectedMedia, async (tx) => {
        await tx.cloudflareImage.update({
          where: { id: f.id('asset') },
          data: { uploaded: false }
        })
        await tx.muxVideo.update({
          where: { id: f.id('mux') },
          data: { readyToStream: false }
        })
        throw new Error('controlled source transaction failure')
      })
    ).rejects.toThrow('controlled source transaction failure')
    expect(
      await media.cloudflareImage.findUniqueOrThrow({
        where: { id: f.id('asset') }
      })
    ).toMatchObject({ uploaded: true })
    expect(
      await media.muxVideo.findUniqueOrThrow({ where: { id: f.id('mux') } })
    ).toMatchObject({ readyToStream: true })
    expect((await search('library')).json.result?.isError).not.toBe(true)
    await settleMedia()
    await sourceTransaction(protectedMedia, async (tx) => {
      await tx.cloudflareImage.update({
        where: { id: f.id('asset') },
        data: { uploaded: false }
      })
      await tx.muxVideo.update({
        where: { id: f.id('mux') },
        data: { readyToStream: false }
      })
    })
    await reject([selectImage()])
    await reject([selectVideo()])
    expect(
      await media.mcpMediaMutation.count({
        where: { status: 'committed', reportedAt: null }
      })
    ).toBe(0)
  })
})
