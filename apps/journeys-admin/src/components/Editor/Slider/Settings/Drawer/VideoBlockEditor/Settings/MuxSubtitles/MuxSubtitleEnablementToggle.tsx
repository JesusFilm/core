import { gql, useMutation, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import { GetMyGeneratedMuxSubtitleTrack } from '../../../../../../../../../__generated__/GetMyGeneratedMuxSubtitleTrack'
import { VideoBlockUpdateSubtitle } from '../../../../../../../../../__generated__/VideoBlockUpdateSubtitle'
import { VideoFields } from '../../../../../../../../../__generated__/VideoFields'
import { useValidateMuxLanguage } from '../../../../../../../../libs/useValidateMuxLanguage'

export const GET_MY_GENERATED_MUX_SUBTITLE_TRACK = gql`
  query GetMyGeneratedMuxSubtitleTrack($muxVideoId: ID!, $bcp47: String!) {
    getMyGeneratedMuxSubtitleTrack(muxVideoId: $muxVideoId, bcp47: $bcp47) {
      __typename
      ... on QueryGetMyGeneratedMuxSubtitleTrackSuccess {
        data {
          id
          status
        }
      }
      ... on Error {
        message
      }
    }
  }
`

export const GET_VIDEO_BLOCK = gql`
  ${VIDEO_FIELDS}
  query GetVideoBlock($id: ID!) {
    block(id: $id) {
      ...VideoFields
    }
  }
`

export const VIDEO_BLOCK_UPDATE_SUBTITLE = gql`
  ${VIDEO_FIELDS}
  mutation VideoBlockUpdateSubtitle($id: ID!, $input: VideoBlockUpdateInput!) {
    videoBlockUpdate(id: $id, input: $input) {
      ...VideoFields
    }
  }
`

interface MuxSubtitleEnablementToggleProps {
  videoBlockId: string | null
  muxVideoId: string | null
  journeyLanguageCode: string | null | undefined
  disabled?: boolean
}

export function MuxSubtitleEnablementToggle({
  videoBlockId,
  muxVideoId,
  journeyLanguageCode,
  disabled = false
}: MuxSubtitleEnablementToggleProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isValidLanguage = useValidateMuxLanguage(journeyLanguageCode)
  const [toggleChecked, setToggleChecked] = useState(false)

  // Query subtitle track status
  const {
    data: subtitleTrackData,
    error: subtitleTrackError,
    startPolling,
    stopPolling
  } = useQuery<GetMyGeneratedMuxSubtitleTrack>(
    GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
    {
      variables: {
        muxVideoId: muxVideoId ?? '',
        bcp47: journeyLanguageCode ?? ''
      },
      skip:
        !isValidLanguage || muxVideoId == null || journeyLanguageCode == null
    }
  )

  // Extract subtitle track from union result
  const subtitleTrack =
    subtitleTrackData?.getMyGeneratedMuxSubtitleTrack.__typename ===
    'QueryGetMyGeneratedMuxSubtitleTrackSuccess'
      ? subtitleTrackData.getMyGeneratedMuxSubtitleTrack.data
      : null

  // Poll for subtitle track status changes when processing
  useEffect(() => {
    if (subtitleTrack?.status === 'processing') {
      console.log('poll for sub gen status')
      startPolling(3000)
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [subtitleTrack?.status, startPolling, stopPolling])

  // Query VideoBlock for current subtitle setting
  const { data: videoBlockData } = useQuery<{ block: VideoFields }>(
    GET_VIDEO_BLOCK,
    {
      variables: { id: videoBlockId ?? '' },
      skip:
        !isValidLanguage ||
        videoBlockId == null ||
        subtitleTrack?.status !== 'ready'
    }
  )

  // Update mutation
  const [updateSubtitleSettings, { loading: updating }] =
    useMutation<VideoBlockUpdateSubtitle>(VIDEO_BLOCK_UPDATE_SUBTITLE)

  // Sync toggle state with fetched data
  useEffect(() => {
    if (
      videoBlockData?.block?.showGeneratedSubtitles != null &&
      subtitleTrack?.status === 'ready'
    ) {
      setToggleChecked(videoBlockData.block.showGeneratedSubtitles)
    }
  }, [videoBlockData, subtitleTrack])

  const handleToggleChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (videoBlockId == null) return

    const newValue = event.target.checked
    setToggleChecked(newValue)

    try {
      await updateSubtitleSettings({
        variables: {
          id: videoBlockId,
          input: {
            showGeneratedSubtitles: newValue
          }
        }
      })
    } catch (error) {
      // Revert on error
      setToggleChecked(!newValue)
    }
  }

  // Determine toggle state and label
  const subtitleStatus = subtitleTrack?.status
  const isToggleDisabled =
    disabled ||
    !isValidLanguage ||
    subtitleTrackError != null ||
    subtitleStatus == null ||
    subtitleStatus === 'processing' ||
    subtitleStatus === 'errored' ||
    updating

  let labelText = t('Subtitles not available for this video')
  if (isValidLanguage && subtitleStatus === 'processing') {
    labelText = t(
      'Auto subtitle generation in progress, please try again later'
    )
  }

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Switch
          checked={toggleChecked}
          onChange={handleToggleChange}
          disabled={isToggleDisabled}
          inputProps={{
            'aria-label': 'Subtitles'
          }}
        />
      </Stack>
      {(isToggleDisabled || subtitleStatus === 'processing') && (
        <Typography variant="caption" color="text.secondary">
          {labelText}
        </Typography>
      )}
    </Stack>
  )
}
