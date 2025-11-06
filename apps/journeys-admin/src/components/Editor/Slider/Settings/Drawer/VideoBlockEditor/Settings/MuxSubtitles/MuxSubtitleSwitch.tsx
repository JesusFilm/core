import { gql, useMutation, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetMyGeneratedMuxSubtitleTrack } from '../../../../../../../../../__generated__/GetMyGeneratedMuxSubtitleTrack'
import { VideoBlockUpdateSubtitle } from '../../../../../../../../../__generated__/VideoBlockUpdateSubtitle'
import { useValidateMuxLanguage } from '../../../../../../../../libs/useValidateMuxLanguage'
import { useEditor } from '@core/journeys/ui/EditorProvider'

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

export const VIDEO_BLOCK_UPDATE_SUBTITLE = gql`
  ${VIDEO_FIELDS}
  mutation VideoBlockUpdateSubtitle($id: ID!, $input: VideoBlockUpdateInput!) {
    videoBlockUpdate(id: $id, input: $input) {
      ...VideoFields
    }
  }
`

interface MuxSubtitleSwitchProps {
  videoBlockId: string | null
  muxVideoId: string | null
  journeyLanguageCode: string | null | undefined
}

export function MuxSubtitleSwitch({
  videoBlockId,
  muxVideoId,
  journeyLanguageCode
}: MuxSubtitleSwitchProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock }
  } = useEditor()
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

  // Mux subtitle generation typically takes longer to complete than the video upload does
  // Poll to check when completed.
  useEffect(() => {
    if (subtitleTrack?.status === 'processing') {
      startPolling(3000)
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [subtitleTrack?.status, startPolling, stopPolling])

  const [updateSubtitleSettings, { loading: updating }] =
    useMutation<VideoBlockUpdateSubtitle>(VIDEO_BLOCK_UPDATE_SUBTITLE)

  const videoBlock = selectedBlock as VideoBlock | undefined

  useEffect(() => {
    if (
      videoBlock?.showGeneratedSubtitles != null &&
      subtitleTrack?.status === 'ready'
    ) {
      setToggleChecked(videoBlock.showGeneratedSubtitles)
    }
  }, [videoBlock, subtitleTrack])

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
  const isProcessing = subtitleStatus === 'processing'
  const isErrored = subtitleStatus === 'errored'

  const isToggleDisabled =
    !isValidLanguage ||
    subtitleTrackError != null ||
    subtitleStatus == null ||
    isProcessing ||
    isErrored ||
    updating

  let labelText = !isValidLanguage
    ? t('Subtitles not available for this video')
    : ''
  if (isValidLanguage && isProcessing) {
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
      {
        <Typography variant="caption" color="text.secondary">
          {labelText}
        </Typography>
      }
    </Stack>
  )
}
