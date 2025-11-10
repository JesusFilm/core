import Stack from '@mui/material/Box'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'
import { validateMuxLanguage } from '../../../../../../../libs/validateMuxLanguage'

import { AddByFile } from './AddByFile'

interface VideoFromMuxProps {
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
}

export function VideoFromMux({ onSelect }: VideoFromMuxProps): ReactElement {
  const { journey } = useJourney()
  const isValidLanguage = validateMuxLanguage(journey?.language?.bcp47)

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
    </Stack>
  )
}
