import { z } from 'zod'

import { env } from '../../../env'
import type { Journey } from '../journeySchema'

import {
  LIBRARY_VIDEOS,
  type ResolvedLibraryVideos,
  videoLookupKey
} from './catalog'

const videoMetadataSchema = z.object({
  id: z.string(),
  title: z.array(z.object({ value: z.string() })),
  variant: z.object({
    id: z.string(),
    hls: z.url(),
    duration: z.number().positive()
  }),
  images: z.array(z.object({ mobileCinematicHigh: z.string().nullable() }))
})
const languageSchema = z.object({
  id: z.string(),
  bcp47: z.string().nullable(),
  name: z.array(z.object({ value: z.string() }))
})
type Language = z.infer<typeof languageSchema>

/** Resolve real catalogue assets and language variants. Never accept invented streams. */
export async function resolveLibraryVideos(
  journey: Journey,
  signal: AbortSignal,
  userId?: string
): Promise<ResolvedLibraryVideos> {
  async function query(
    query: string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const response = await fetch(env.GATEWAY_URL, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'interop-token': env.INTEROP_TOKEN
      },
      body: JSON.stringify({ query, variables })
    })
    if (!response.ok) throw new Error(`Media lookup failed: ${response.status}`)
    return await response.json()
  }
  const languageRequests = new Map<string, Promise<Language>>()
  function languageByName(term: string): Promise<Language> {
    let request = languageRequests.get(term)
    if (request != null) return request
    request = (async () => {
      const response = z
        .object({ data: z.object({ languages: z.array(languageSchema) }) })
        .parse(
          await query(
            `query BuilderLanguage($term: String!) { languages(term: $term, limit: 20) { id bcp47 name(languageId: "529", primary: true) { value } } }`,
            { term: term.split(/[,(]/)[0].trim() }
          )
        )
      const matches = response.data.languages.filter(
        (language) =>
          language.name.some(
            (name) => name.value.toLowerCase() === term.toLowerCase()
          ) || language.bcp47?.toLowerCase() === term.toLowerCase()
      )
      const match =
        matches.length === 1
          ? matches[0]
          : response.data.languages.length === 1
            ? response.data.languages[0]
            : undefined
      if (match == null)
        throw new Error(
          `Choose an exact language for "${term}". Options: ${response.data.languages.map((language) => `${language.name.map((name) => name.value).join(' / ')} (${language.id})`).join('; ') || 'none'}.`
        )
      return match
    })()
    languageRequests.set(term, request)
    return request
  }
  if (journey.language != null) {
    const bcp47 = journey.language.bcp47
    async function findLanguage(tag: string): Promise<Language[]> {
      return z
        .object({ data: z.object({ languages: z.array(languageSchema) }) })
        .parse(
          await query(
            `query BuilderContentLanguage($tag: String!) { languages(where: { bcp47: [$tag] }, limit: 2) { id bcp47 name(languageId: "529", primary: true) { value } } }`,
            { tag }
          )
        ).data.languages
    }
    let matches = await findLanguage(bcp47)
    if (matches.length === 0 && bcp47.includes('-'))
      matches = await findLanguage(bcp47.split('-')[0])
    if (matches.length !== 1)
      throw new Error(`Choose a supported content language for "${bcp47}".`)
    journey.language.id = matches[0].id
  }
  const videos = journey.steps.flatMap((step) => [
    ...(step.card.backgroundVideo != null ? [step.card.backgroundVideo] : []),
    ...step.card.content.flatMap((item) =>
      item.type === 'video' ? [item] : []
    )
  ])
  const requests = new Map<
    string,
    Promise<NonNullable<ResolvedLibraryVideos[string]>>
  >()
  await Promise.all(
    videos.map(async (video) => {
      if (video.subtitleLanguageName != null) {
        const language = await languageByName(video.subtitleLanguageName)
        video.subtitleLanguageId = language.id
        video.subtitleLanguageBcp47 = language.bcp47 ?? undefined
      }
      const key = videoLookupKey(video)
      if (key == null || requests.has(key)) return
      const request = (async () => {
        const language =
          video.languageName != null
            ? await languageByName(video.languageName)
            : null
        const languageId = language?.id ?? video.languageId ?? '529'
        if (video.muxVideoId != null) {
          if (userId == null)
            throw new Error('Sign in to use an existing uploaded video.')
          const response = z
            .object({
              data: z.object({
                getMuxVideo: z
                  .object({
                    id: z.string(),
                    userId: z.string(),
                    name: z.string().nullable(),
                    assetId: z.string().nullable(),
                    playbackId: z.string(),
                    duration: z.number().positive(),
                    readyToStream: z.literal(true)
                  })
                  .nullable()
              })
            })
            .parse(
              await query(
                `query BuilderUpload($id: ID!) { getMuxVideo(id: $id, userGenerated: true) { id userId name assetId playbackId duration readyToStream } }`,
                { id: video.muxVideoId }
              )
            )
          const asset = response.data.getMuxVideo
          if (asset == null)
            throw new Error(
              'The selected upload is not available or is still processing.'
            )
          if (asset.userId !== userId)
            throw new Error(
              'Choose an uploaded video owned by your signed-in account.'
            )
          return {
            id: asset.id,
            title: asset.name ?? 'Uploaded video',
            source: 'mux' as const,
            assetId: asset.assetId,
            playbackId: asset.playbackId,
            hls: `https://stream.mux.com/${asset.playbackId}.m3u8`,
            variantId: asset.id,
            duration: asset.duration,
            poster: `https://image.mux.com/${asset.playbackId}/thumbnail.jpg`,
            languageId
          }
        }
        let id =
          video.libraryVideoId ??
          (video.libraryVideo != null
            ? LIBRARY_VIDEOS[video.libraryVideo].id
            : undefined)
        if (video.librarySearch != null) {
          const response = z
            .object({
              data: z.object({
                videos: z.array(
                  z.object({
                    id: z.string(),
                    title: z.array(z.object({ value: z.string() }))
                  })
                )
              })
            })
            .parse(
              await query(
                `query BuilderVideoSearch($title: String!, $languageId: ID!) { videos(where: { title: $title, published: true, availableVariantLanguageIds: [$languageId] }, limit: 10) { id title(primary: true) { value } } }`,
                { title: video.librarySearch, languageId }
              )
            )
          const matches = response.data.videos.filter((item) =>
            item.title.some(
              (title) =>
                title.value.toLowerCase() === video.librarySearch?.toLowerCase()
            )
          )
          const selected =
            matches.length === 1
              ? matches[0]
              : response.data.videos.length === 1
                ? response.data.videos[0]
                : undefined
          if (selected == null)
            throw new Error(
              `Choose an exact library title for "${video.librarySearch}". Matches: ${response.data.videos.map((item) => item.title[0]?.value ?? item.id).join(', ') || 'none'}.`
            )
          id = selected.id
        }
        if (id == null)
          throw new Error(
            'Choose a library film, search title or existing upload.'
          )
        const response = z
          .object({ data: z.object({ video: videoMetadataSchema }) })
          .parse(
            await query(
              `query AiBuilderLibraryVideo($id: ID!, $languageId: ID!) { video(id: $id) { id title(primary: true) { value } variant(languageId: $languageId) { id hls duration } images(aspectRatio: banner) { mobileCinematicHigh } } }`,
              { id, languageId }
            )
          )
        const asset = response.data.video
        return {
          id: asset.id,
          title: asset.title[0]?.value ?? id,
          duration: asset.variant.duration,
          variantId: asset.variant.id,
          hls: asset.variant.hls,
          poster: asset.images[0]?.mobileCinematicHigh ?? null,
          ...(languageId !== '529'
            ? {
                languageId,
                languageName: language?.name[0]?.value ?? languageId
              }
            : {})
        }
      })()
      requests.set(key, request)
    })
  )
  const result: ResolvedLibraryVideos = {}
  await Promise.all(
    [...requests].map(async ([key, request]) => {
      result[key] = await request
    })
  )
  for (const video of videos) {
    const key = videoLookupKey(video)
    const metadata = key != null ? result[key] : undefined
    if (metadata == null) continue
    if (
      (video.startAt ?? 0) >= metadata.duration ||
      (video.endAt ?? metadata.duration) > metadata.duration
    )
      throw new Error(
        `Clip must fit within "${metadata.title}" (${metadata.duration} seconds).`
      )
  }
  return result
}
