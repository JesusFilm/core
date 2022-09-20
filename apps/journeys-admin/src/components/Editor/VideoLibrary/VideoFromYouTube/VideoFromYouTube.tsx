import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import useSWRInfinite from 'swr/infinite'
import { reduce } from 'lodash'
import Typography from '@mui/material/Typography'
import fetch from 'node-fetch'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { VideoSearch } from '../VideoSearch'
import { VideoList } from '../VideoList'
import { VideoListProps } from '../VideoList/VideoList'

interface VideoFromYouTubeProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export interface YoutubeVideosData {
  items: Array<{
    id: string
    snippet: {
      title: string
      description: string
      thumbnails: { default: { url: string } }
    }
    contentDetails: {
      duration: string
    }
  }>
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
  const videosData: YoutubeVideosData = await (
    await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${query}&${params}`
    )
  ).json()
  return {
    nextPageToken: videosData.nextPageToken,
    items: videosData.items.map((video) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      image: video.snippet.thumbnails.default.url,
      duration: parseISO8601Duration(video.contentDetails.duration),
      source: VideoBlockSource.youTube
    }))
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
        : `chart=mostPopular&pageToken=${pageToken}`
    },
    fetcher
  )
  const loading = Boolean(
    (data == null && error == null) ||
      (size > 0 && data && typeof data[size - 1] === 'undefined')
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
