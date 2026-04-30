import Stack from '@mui/material/Box'
import { ReactElement } from 'react'
import { useTranslation } from 'next-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'
import { validateMuxLanguage } from '../../../../../../../libs/validateMuxLanguage'
import { useMuxVideoUpload } from '../../../../../../MuxVideoUploadProvider'

import { AddByFile } from './AddByFile'
import { MyMuxVideosGrid } from './MyMuxVideosGrid'

interface VideoFromMuxProps {
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
}

export function VideoFromMux({ onSelect }: VideoFromMuxProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedBlock }
  } = useEditor()
  const { getUploadStatus } = useMuxVideoUpload()
  const isValidLanguage = validateMuxLanguage(journey?.language?.bcp47)

  const uploadTask =
    selectedBlock?.id != null ? getUploadStatus(selectedBlock.id) : null
  const uploading =
    uploadTask?.status === 'uploading' ||
    uploadTask?.status === 'processing' ||
    uploadTask?.status === 'waiting'

  const selectedVideoId =
    selectedBlock?.__typename === 'VideoBlock' &&
    selectedBlock.source === VideoBlockSource.mux
      ? selectedBlock.videoId
      : null

  const handleChange = (id: string, shouldCloseDrawer?: boolean): void => {
    const block: VideoBlockUpdateInput = {
      videoId: id,
      source: VideoBlockSource.mux,
      startAt: 0,
      // conditionally add subtitleLanguageId - only if valid mux language,
      // else we assume no subtitle generation will happen for the video
      ...(isValidLanguage &&
        journey?.language?.id != null && {
          subtitleLanguageId: journey.language.id
        })
    }
    onSelect(block, shouldCloseDrawer)
  }

  return (
    <Stack sx={{ bgcolor: 'background.paper' }} data-testid="VideoFromMux">
      <AddByFile onChange={handleChange} />
      <MyMuxVideosGrid
        title={t('Your uploads')}
        selectedVideoId={selectedVideoId}
        onSelect={onSelect}
        uploading={uploading}
      />
    </Stack>
  )
}
