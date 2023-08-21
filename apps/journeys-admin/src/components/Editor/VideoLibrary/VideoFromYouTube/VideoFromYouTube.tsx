import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import reduce from 'lodash/reduce'
import fetch from 'node-fetch'
import { ReactElement, useState } from 'react'
import useSWRInfinite from 'swr/infinite'

import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { VideoList } from '../VideoList'
import { VideoListProps } from '../VideoList/VideoList'
import { VideoSearch } from '../VideoSearch'

interface VideoFromYouTubeProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export interface YoutubeVideo {
  kind: 'youtube#video'
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: { default: { url: string } }
  }
  contentDetails: {
    duration: string
  }
}

export interface YoutubePlaylist {
  kind: 'youtube#playlistItem'
  snippet: {
    title: string
    description: string
    thumbnails: { default: { url: string } }
  }
  contentDetails: {
    videoId: string
  }
}

export interface YoutubeVideosData {
  items: Array<YoutubeVideo | YoutubePlaylist>
  nextPageToken?: string
}

interface Data {
  items: Required<VideoListProps>['videos']
  nextPageToken?: string
}

export function parseISO8601Duration(duration: string): number {
  const match = duration.match(/P(\d+Y)?(\d+W)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?/)

  if (match == null) {
    console.error(`Invalid duration: ${duration}`)
    return 0
  }
  const [years, weeks, days, hours, minutes, seconds] = match
    .slice(1)
    .map((period) => (period != null ? parseInt(period.replace(/\D/, '')) : 0))
  return (
    (((years * 365 + weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 +
    seconds
  )
}

const fetcher = async (query: string): Promise<Data> => {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''
  }).toString()
  const apiUrl = query.startsWith('id')
    ? `https://www.googleapis.com/youtube/v3/videos?${query}&${params}`
    : `https://www.googleapis.com/youtube/v3/playlistItems?${query}&${params}`

  const videosData: YoutubeVideosData = await (await fetch(apiUrl)).json()

  const items = videosData.items.map((item) => ({
    id: item.kind === 'youtube#video' ? item.id : item.contentDetails.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    image: item.snippet.thumbnails.default.url,
    source: VideoBlockSource.youTube,
    duration:
      item.kind === 'youtube#video'
        ? parseISO8601Duration(item.contentDetails.duration)
        : undefined
  }))

  return {
    nextPageToken: videosData.nextPageToken,
    items
  }
}

export function VideoFromYouTube({
  onSelect
}: VideoFromYouTubeProps): ReactElement {
  const [url, setUrl] = useState<string>('')
  const { data, error, size, setSize } = useSWRInfinite<Data>(
    (_pageIndex, previousPageData?: Data) => {
      const YOUTUBE_ID_REGEX =
        /^(?:https?:)?\/\/[^/]*(?:youtube(?:-nocookie)?.com|youtu.be).*[=/](?<id>[-\w]{11})(?:\\?|=|&|$)/

      const id = url.match(YOUTUBE_ID_REGEX)?.groups?.id
      const pageToken = previousPageData?.nextPageToken ?? ''
      return id != null
        ? `id=${id}`
        : `playlistId=${
            process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID ?? ''
          }&pageToken=${pageToken}`
    },
    fetcher
  )

  const loading = Boolean(
    (data == null && error == null) ||
      (size > 0 && (data != null) && typeof data[size - 1] === 'undefined')
  )

  const videos = reduce(
    data,
    (result, request) => [...result, ...request.items],
    [] as Required<VideoListProps>['videos']
  )

  return (
    <>
      <VideoSearch
        value={url}
        onChange={setUrl}
        label="Paste any YouTube Link"
        icon="link"
      />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {videos.length > 1 && (
          <Box sx={{ pb: 4, px: 6 }}>
            <Typography variant="overline" color="primary">
              YouTube
            </Typography>
            <Typography variant="h6">Featured Videos</Typography>
          </Box>
        )}
        <VideoList
          onSelect={onSelect}
          loading={loading}
          videos={videos}
          fetchMore={async () => {
            await setSize(size + 1)
          }}
          hasMore={data?.[data.length - 1]?.nextPageToken != null}
        />
      </Box>
    </>
  )
}
