import Stack from '@mui/material/Box'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'
import { validateMuxLanguage } from '../../../../../../../libs/validateMuxLanguage'
import { useMuxVideoUpload } from '../../../../../../MuxVideoUploadProvider'
import { isUploadActive } from '../../../../../../MuxVideoUploadProvider/utils/isUploadActive'

import { AddByFile } from './AddByFile'
import { MyMuxVideos } from './MyMuxVideos'

interface VideoFromMuxProps {
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
  videoBlock?: TreeBlock<VideoBlock> | null
}

export function VideoFromMux({
  onSelect,
  videoBlock
}: VideoFromMuxProps): ReactElement {
  const { journey } = useJourney()
  const { activeTeam, refetch: refetchTeams } = useTeam()
  const {
    state: { selectedBlock }
  } = useEditor()
  const { getUploadStatus } = useMuxVideoUpload()
  const { mediaLibrary } = useFlags()
  const isValidLanguage = validateMuxLanguage(journey?.language?.bcp47)

  // Upload tasks are keyed by the editor's selected block, not by videoBlock,
  // and must match the key AddByFile writes under. In the background-media
  // flow a fresh upload has no video block yet (it's created once Mux finishes),
  // so we key on the card — which already exists — instead.
  const uploadTask =
    selectedBlock?.id != null ? getUploadStatus(selectedBlock.id) : null
  const uploading = isUploadActive(uploadTask)

  const selectedVideoId =
    videoBlock?.source === VideoBlockSource.mux ? videoBlock.videoId : null

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
      {mediaLibrary === true && (
        <MyMuxVideos
          selectedVideoId={selectedVideoId}
          onSelect={onSelect}
          uploading={uploading}
          teamId={activeTeam?.id ?? null}
          onTeamForbidden={() => {
            void refetchTeams()
          }}
        />
      )}
    </Stack>
  )
}
