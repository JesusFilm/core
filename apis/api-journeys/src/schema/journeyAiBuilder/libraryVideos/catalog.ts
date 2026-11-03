/** The four English NUA videos used by the seeded journeys. */
export const LIBRARY_VIDEO_KEYS = [
  'fact-or-fiction',
  'resurrection',
  'jesus-and-me',
  'decision'
] as const

export type LibraryVideoKey = (typeof LIBRARY_VIDEO_KEYS)[number]

export const LIBRARY_VIDEOS = {
  'fact-or-fiction': {
    id: '7_0-nfs0201',
    title: 'Fact or Fiction / Was Jesus the Real Deal?',
    duration: 330,
    description:
      'Can the story of Jesus be trusted? Introduction 0–133 seconds; historical discussion 134–306; closing 306–330.'
  },
  resurrection: {
    id: '7_0-nfs0301',
    title: 'What About the Resurrection?',
    duration: 342,
    description:
      'The empty tomb and explanations for the resurrection. Introduction 0–108 seconds; discussion 109–272; response 272–342.'
  },
  'jesus-and-me': {
    id: '7_0-nfs10',
    title: "What's Jesus Got to Do With Me?",
    duration: 501,
    description:
      "Jesus' death and resurrection, grace and personal relevance. Introduction 0–161 seconds; love and acceptance 158–221; personal response 221–382."
  },
  decision: {
    id: '7_0-nfs0803',
    title: 'Decision / Can I Know Him?',
    duration: 436,
    description:
      'An invitation to trust Jesus and begin a relationship with him. The seeded introductory section is 0–166 seconds.'
  }
} satisfies Record<
  LibraryVideoKey,
  {
    id: string
    title: string
    duration: number
    description: string
  }
>

export interface ResolvedLibraryVideo {
  id: string
  title: string
  duration: number
  variantId: string
  hls: string
  poster: string | null
  languageId?: string
  languageName?: string
  source?: 'internal' | 'mux'
  assetId?: string | null
  playbackId?: string
}

export type ResolvedLibraryVideos = Partial<
  Record<string, ResolvedLibraryVideo>
>

export interface VideoReference {
  libraryVideo?: LibraryVideoKey
  libraryVideoId?: string
  librarySearch?: string
  muxVideoId?: string
  languageId?: string
  languageName?: string
}

export function videoLookupKey(video: VideoReference): string | undefined {
  const source =
    video.libraryVideo ??
    video.libraryVideoId ??
    video.librarySearch ??
    video.muxVideoId
  if (source == null) return undefined
  const key =
    video.muxVideoId != null
      ? `mux:${source}`
      : video.librarySearch != null
        ? `search:${source}`
        : source
  const language = video.languageName ?? video.languageId
  return language == null || language === '529' ? key : `${key}:${language}`
}
