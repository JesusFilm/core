import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetMyGeneratedMuxSubtitleTrack } from '../../../../../../../../../__generated__/GetMyGeneratedMuxSubtitleTrack'
import { validateMuxLanguage } from '../../../../../../../../libs/validateMuxLanguage'

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

interface MuxSubtitleSwitchProps {
  videoBlockId: string | null
  muxVideoId: string | null
  journeyLanguageCode: string | null | undefined
  onChange: (showGeneratedSubtitles: boolean) => Promise<void>
}

export function MuxSubtitleSwitch({
  videoBlockId,
  muxVideoId,
  journeyLanguageCode,
  onChange
}: MuxSubtitleSwitchProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock }
  } = useEditor()

  const videoBlock =
    selectedBlock?.__typename === 'VideoBlock' ? selectedBlock : undefined

  const isValidLanguage = validateMuxLanguage(journeyLanguageCode)
  const [toggleChecked, setToggleChecked] = useState(
    videoBlock?.showGeneratedSubtitles ?? false
  )
  const [updating, setUpdating] = useState(false)

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

  useEffect(() => {
    if (
      videoBlock?.showGeneratedSubtitles != null &&
      subtitleTrack?.status === 'ready'
    ) {
      setToggleChecked(videoBlock.showGeneratedSubtitles)
    }
  }, [videoBlock, subtitleTrack])

  // Programmatically turn off switch when language becomes invalid
  useEffect(() => {
    if (!isValidLanguage && toggleChecked && !updating) {
      setToggleChecked(false)
      if (videoBlockId != null) {
        onChange(false).catch(() => {
          // Revert on error
          setToggleChecked(true)
        })
      }
    }
  }, [isValidLanguage, toggleChecked, updating, videoBlockId, onChange])

  const handleToggleChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (videoBlockId == null) return

    const newValue = event.target.checked
    setToggleChecked(newValue)
    setUpdating(true)

    try {
      await onChange(newValue)
    } catch (error) {
      // Revert on error
      setToggleChecked(!newValue)
    } finally {
      setUpdating(false)
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
    ? t('Subtitles not available for this video language')
    : ''
  if (isValidLanguage && isProcessing) {
    labelText = t(
      'Auto subtitle generation in progress, please try again later'
    )
  }

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">{t('Subtitles')}</Typography>
        <Switch
          data-testid="MuxSubtitleSwitch"
          checked={toggleChecked}
          onChange={handleToggleChange}
          disabled={isToggleDisabled}
          inputProps={{
            'aria-label': 'Subtitles'
          }}
        />
      </Stack>
      {labelText && (
        <Typography variant="caption" color="text.secondary">
          {labelText}
        </Typography>
      )}
    </Stack>
  )
}
