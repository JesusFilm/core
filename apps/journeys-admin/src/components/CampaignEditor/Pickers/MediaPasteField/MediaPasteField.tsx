import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, useState } from 'react'
import useSWR from 'swr'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import {
  VideoBlockSource,
  VideoLabel
} from '../../../../../__generated__/globalTypes'
import { fetchYouTubeVideo } from '../../../../libs/fetchYouTubeVideo'
import { parseISO8601Duration } from '../../../../libs/parseISO8601Duration'
import type { CampaignVideoPick } from '../../../../libs/useCampaignVideoBlockCreateMutation'
import { useCampaignWatchVideoQuery } from '../../../../libs/useCampaignWatchVideoQuery'
import { AddByFile } from '../../../Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/AddByFile'
import { messageOf } from '../../utils/useCampaignStyleCommand'
import { ImagePicker } from '../ImagePicker'

import { ParsedMediaUrl, parseMediaUrl } from './parseMediaUrl'

/** What a Media Slot pick names: a Watch, YouTube or Mux video, or an image's stored address. */
export type CampaignMediaPick = CampaignVideoPick | { src: string }

type MediaTab = 'link' | 'upload' | 'image'

type Translate = (key: string, options?: Record<string, unknown>) => string

function videoLabelName(t: Translate, label: VideoLabel): string {
  switch (label) {
    case VideoLabel.behindTheScenes:
      return t('Behind the scenes')
    case VideoLabel.collection:
      return t('Collection')
    case VideoLabel.episode:
      return t('Episode')
    case VideoLabel.featureFilm:
      return t('Feature film')
    case VideoLabel.segment:
      return t('Segment')
    case VideoLabel.series:
      return t('Series')
    case VideoLabel.shortFilm:
      return t('Short film')
    case VideoLabel.trailer:
      return t('Trailer')
  }
}

/** The resolved target shown before a pasted link is kept. */
interface ResolvedVideo {
  title: string
  image?: string | null
  /** The label (or YouTube), then "<n> videos" or the duration. */
  details: string[]
}

interface Resolution {
  video?: ResolvedVideo
  error?: string
  loading: boolean
}

/**
 * Resolve the link being previewed: a Watch address through the gateway by
 * its variant slug, a YouTube link as the journey video library resolves
 * one. Errors are the source's message, verbatim.
 */
function useResolution(
  candidate: ParsedMediaUrl | undefined,
  t: Translate
): Resolution {
  const watch = useCampaignWatchVideoQuery(
    candidate?.source === VideoBlockSource.internal ? candidate.slug : undefined
  )
  const youTube = useSWR(
    candidate?.source === VideoBlockSource.youTube ? candidate.videoId : null,
    fetchYouTubeVideo
  )
  if (candidate == null) return { loading: false }

  if (candidate.source === VideoBlockSource.internal) {
    if (watch.error != null)
      return { error: messageOf(watch.error), loading: false }
    const video = watch.data?.video
    if (video == null) return { loading: true }
    const details = [videoLabelName(t, video.label)]
    if (video.childrenCount > 0)
      details.push(t('{{count}} videos', { count: video.childrenCount }))
    else if (video.variant != null)
      details.push(
        secondsToTimeFormat(video.variant.duration, { trimZeroes: true })
      )
    return {
      video: {
        title: video.title[0]?.value ?? '',
        image: video.images[0]?.mobileCinematicHigh,
        details
      },
      loading: false
    }
  }

  if (youTube.error != null)
    return { error: messageOf(youTube.error), loading: false }
  if (youTube.isLoading) return { loading: true }
  const data = youTube.data
  if (data == null)
    return {
      error: t('That YouTube video could not be found'),
      loading: false
    }
  return {
    video: {
      title: data.snippet.title,
      image: data.snippet.thumbnails.high?.url,
      details: [
        t('YouTube'),
        secondsToTimeFormat(
          parseISO8601Duration(data.contentDetails.duration),
          {
            trimZeroes: true
          }
        )
      ]
    },
    loading: false
  }
}

function PreviewCard({
  video,
  testId
}: {
  video: ResolvedVideo
  testId: string
}): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={2}
      data-testid={`${testId}Resolved`}
      sx={{ alignItems: 'center' }}
    >
      {video.image != null && (
        <Box
          component="img"
          src={video.image}
          alt=""
          sx={{
            width: 96,
            aspectRatio: '16 / 9',
            objectFit: 'cover',
            borderRadius: 1,
            bgcolor: 'action.hover',
            flexShrink: 0
          }}
        />
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{video.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {video.details.join(' · ')}
        </Typography>
      </Box>
    </Stack>
  )
}

interface MediaPasteFieldProps {
  /** The campaign's team: image uploads and fetched pastes are recorded under it. */
  teamId: string
  /** Keys the Mux upload task: the section whose Media Slot the upload fills. */
  uploadKey: string
  /** One call when the author keeps a video or an image. */
  onPick: (pick: CampaignMediaPick) => void
  testId?: string
}

/**
 * The Media Slot picker (PRD §5): paste a Watch or YouTube link, upload a
 * video, or pick an image — no library browsing. A pasted link is checked
 * for its shape here and shown resolved (title, label, children count or
 * duration) before it is kept: a Watch address through the gateway's
 * `video(id, idType: slug)`, a YouTube link as the journey video library
 * resolves one. Upload is the video library's Mux upload, picked when Mux
 * has finished; an image goes through the image picker.
 */
export function MediaPasteField({
  teamId,
  uploadKey,
  onPick,
  testId = 'CampaignMediaPasteField'
}: MediaPasteFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [tab, setTab] = useState<MediaTab>('link')
  const [url, setUrl] = useState('')
  const [candidate, setCandidate] = useState<ParsedMediaUrl>()

  const parsed = parseMediaUrl(url)
  const resolution = useResolution(candidate, t)
  const urlValid = url.trim() === '' || parsed != null

  function handleUrlChange(event: ChangeEvent<HTMLInputElement>): void {
    setUrl(event.target.value)
    setCandidate(undefined)
  }

  function handlePreview(): void {
    if (parsed == null) return
    setCandidate(parsed)
  }

  function handleKeep(): void {
    if (candidate == null || resolution.video == null) return
    if (candidate.source === VideoBlockSource.internal) {
      onPick({ source: VideoBlockSource.internal, url: candidate.url })
    } else {
      onPick({ source: VideoBlockSource.youTube, videoId: candidate.videoId })
    }
    setUrl('')
    setCandidate(undefined)
  }

  function handleUploadComplete(videoId: string): void {
    onPick({ source: VideoBlockSource.mux, videoId })
  }

  /** AddByFile keys its upload task by the journey editor's selected block; here that is the slot's section. */
  const uploadTarget = {
    __typename: 'VideoBlock',
    id: uploadKey,
    parentBlockId: null,
    parentOrder: null,
    children: []
  } as unknown as TreeBlock

  return (
    <Stack spacing={3} data-testid={testId}>
      <Tabs
        value={tab}
        onChange={(_event, value: MediaTab) => setTab(value)}
        variant="fullWidth"
      >
        <Tab value="link" label={t('Paste a link')} />
        <Tab value="upload" label={t('Upload')} />
        <Tab value="image" label={t('Image')} />
      </Tabs>
      {tab === 'link' && (
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label={t('Watch or YouTube link')}
              value={url}
              onChange={handleUrlChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handlePreview()
                }
              }}
              error={!urlValid}
              helperText={
                urlValid
                  ? undefined
                  : t('Paste a jesusfilm.org/watch or YouTube video link')
              }
              size="small"
              fullWidth
              slotProps={{ htmlInput: { 'data-testid': `${testId}Url` } }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handlePreview}
              disabled={parsed == null}
              sx={{ mt: 0.5, whiteSpace: 'nowrap' }}
            >
              {t('Preview')}
            </Button>
          </Stack>
          {candidate != null && (
            <Stack spacing={2}>
              {resolution.loading && (
                <Box
                  data-testid={`${testId}Resolving`}
                  sx={{ display: 'flex', justifyContent: 'center', py: 3 }}
                >
                  <CircularProgress size={24} />
                </Box>
              )}
              {resolution.error != null && (
                <Alert severity="error" role="alert">
                  {resolution.error}
                </Alert>
              )}
              {resolution.video != null && (
                <PreviewCard video={resolution.video} testId={testId} />
              )}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleKeep}
                  disabled={resolution.video == null}
                >
                  {t('Use video')}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setCandidate(undefined)}
                >
                  {t('Cancel')}
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      )}
      {tab === 'upload' && (
        <EditorProvider initialState={{ selectedBlock: uploadTarget }}>
          <AddByFile onChange={handleUploadComplete} />
        </EditorProvider>
      )}
      {tab === 'image' && (
        <ImagePicker
          teamId={teamId}
          onPick={(src) => onPick({ src })}
          testId={`${testId}Image`}
        />
      )}
    </Stack>
  )
}
