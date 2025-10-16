import { Icon, InputGroup } from '@blueprintjs/core'
import { Search, Video } from '@blueprintjs/icons'
import { observer } from 'mobx-react-lite'
import type { StoreType } from 'polotno/model/store'
import { selectVideo } from 'polotno/side-panel/select-video'
import type { Section } from 'polotno/side-panel/side-panel'
import { SectionTab } from 'polotno/side-panel/tab-button'
import { VideosGrid } from 'polotno/side-panel/videos-grid'
import { t } from 'polotno/utils/l10n'
import { useInfiniteAPI } from 'polotno/utils/use-api'
import { useMemo } from 'react'

const JESUS_FILM_LANGUAGE_ID =
  process.env.NEXT_PUBLIC_JESUS_FILM_LANGUAGE_ID ?? '529'
const JESUS_FILM_PAGE_SIZE = 20
const WATCH_BASE_URL =
  process.env.NEXT_PUBLIC_WATCH_URL ?? 'https://www.jesusfilm.org/watch/'
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL

interface JesusFilmVideoDownload {
  quality: string
  url: string
}

interface JesusFilmVideoVariant {
  duration: number
  hls?: string | null
  downloads?: JesusFilmVideoDownload[] | null
}

interface JesusFilmVideoImage {
  mobileCinematicHigh?: string | null
}

interface JesusFilmVideoTitle {
  value: string
}

interface JesusFilmVideo {
  id: string
  title?: JesusFilmVideoTitle[] | null
  images?: JesusFilmVideoImage[] | null
  variant?: JesusFilmVideoVariant | null
}

interface JesusFilmVideosResponse {
  items: JesusFilmVideo[]
  page: number
  perPage: number
  totalPages: number
}

interface NormalizedVideoItem {
  id: string
  duration: number
  width: number
  height: number
  video_files: Array<{ quality: string; link: string }>
  video_pictures: Array<{ picture: string }>
  creditUrl: string
  title?: string
}

const JESUS_FILM_VIDEOS_QUERY = `
  query PolotnoJesusFilmVideos(
    $where: VideosFilter
    $offset: Int
    $limit: Int
    $languageId: ID
  ) {
    videos(where: $where, offset: $offset, limit: $limit) {
      id
      title(languageId: $languageId, primary: true) {
        value
      }
      images(aspectRatio: banner) {
        mobileCinematicHigh
      }
      variant(languageId: $languageId) {
        duration
        hls
        downloads {
          quality
          url
        }
      }
    }
  }
`

const fetchJesusFilmVideos = async (
  key: string
): Promise<JesusFilmVideosResponse> => {
  const params = JSON.parse(key) as {
    resource?: string
    query: string
    page: number
    perPage: number
  }

  if (GATEWAY_URL == null) {
    throw new Error('Missing NEXT_PUBLIC_GATEWAY_URL for Jesus Film videos')
  }

  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-graphql-client-name': 'studio',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    },
    body: JSON.stringify({
      query: JESUS_FILM_VIDEOS_QUERY,
      variables: {
        where:
          params.query.trim().length > 0
            ? { title: params.query.trim(), published: true }
            : { published: true },
        offset: (params.page - 1) * params.perPage,
        limit: params.perPage,
        languageId: JESUS_FILM_LANGUAGE_ID
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to load Jesus Film videos (${response.status})`)
  }

  const json = await response.json()

  if (json.errors?.length > 0) {
    throw new Error(json.errors[0]?.message ?? 'Unknown GraphQL error')
  }

  const videos: JesusFilmVideo[] = json.data?.videos ?? []
  const totalPages =
    videos.length < params.perPage ? params.page : params.page + 1

  return {
    items: videos,
    page: params.page,
    perPage: params.perPage,
    totalPages
  }
}

const normalizeVideo = (video: JesusFilmVideo): NormalizedVideoItem | null => {
  const downloads = video.variant?.downloads?.filter(
    (download): download is JesusFilmVideoDownload =>
      download != null && typeof download.url === 'string'
  )

  const videoFiles = (downloads ?? []).map((download) => ({
    quality:
      download.quality === 'high' || download.quality === 'highest'
        ? 'hd'
        : 'sd',
    link: download.url
  }))

  if (videoFiles.length === 0 && video.variant?.hls) {
    videoFiles.push({ quality: 'sd', link: video.variant.hls })
  }

  if (videoFiles.length === 0) return null

  const poster = video.images?.[0]?.mobileCinematicHigh

  return {
    id: video.id,
    duration: video.variant?.duration ?? 0,
    width: 1280,
    height: 720,
    video_files: videoFiles,
    video_pictures: poster ? [{ picture: poster }] : [],
    creditUrl: WATCH_BASE_URL,
    title: video.title?.[0]?.value
  }
}

const JesusFilmVideosPanel = observer(({ store }: { store: StoreType }) => {
  const { data, setQuery, loadMore, isLoading, error, isReachingEnd } =
    useInfiniteAPI({
      defaultQuery: '',
      getAPI: ({ query, page }) =>
        JSON.stringify({
          resource: 'jesus-film-videos',
          query,
          page,
          perPage: JESUS_FILM_PAGE_SIZE
        }),
      getSize: (page) => page.totalPages,
      fetchFunc: fetchJesusFilmVideos
    })

  const videos = useMemo(() => {
    if (data == null) return []

    return data
      .flatMap((page) => page.items)
      .map(normalizeVideo)
      .filter((item): item is NormalizedVideoItem => item != null)
  }, [data])

  const handleSelect = async (
    item: NormalizedVideoItem,
    droppedPos?: { x: number; y: number },
    targetElement?: { type?: string }
  ) => {
    const src =
      item.video_files.find((file) => file.quality === 'hd')?.link ??
      item.video_files[0]?.link

    if (!src) return

    await selectVideo({
      src,
      store,
      droppedPos,
      targetElement,
      attrs: { width: item.width, height: item.height }
    })
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <InputGroup
        leftIcon={<Search />}
        placeholder={t('sidePanel.searchPlaceholder')}
        onChange={(event) => setQuery(event.target.value)}
        type="search"
        style={{ marginBottom: '20px' }}
      />
      <p style={{ textAlign: 'center' }}>
        Videos by{' '}
        <a href={WATCH_BASE_URL} target="_blank" rel="noreferrer noopener">
          Jesus Film Project
        </a>
      </p>
      <VideosGrid
        items={videos}
        onSelect={handleSelect}
        loadMore={() => {
          if (!isReachingEnd) {
            loadMore()
          }
        }}
        isLoading={isLoading}
        error={error as Error | undefined}
        getCredit={(video) => (
          <span>
            Video by{' '}
            <a
              href={video.creditUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Jesus Film Project
            </a>
          </span>
        )}
      />
    </div>
  )
})

export const JesusFilmVideosSection: Section = {
  name: 'jesus-film-videos',
  Tab: observer((props) => (
    <SectionTab {...props} name="Jesus Film">
      <Icon icon={<Video />} />
    </SectionTab>
  )),
  Panel: JesusFilmVideosPanel
}
