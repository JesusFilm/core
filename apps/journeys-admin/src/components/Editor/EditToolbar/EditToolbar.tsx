import VisibilityIcon from '@mui/icons-material/Visibility'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { DuplicateBlock } from '../../DuplicateBlock'

import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  const { journey } = useJourney()
  const { state } = useEditor()

  return (
    <>
      <IconButton
        aria-label="Preview"
        href={`/api/preview?slug=${journey?.slug ?? ''}`}
        target="_blank"
        disabled={journey == null || journey?.status === JourneyStatus.draft}
      >
        <VisibilityIcon />
      </IconButton>
      <DeleteBlock
        variant="button"
        disabled={
          state.journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
        }
      />
      <DuplicateBlock
        variant="button"
        disabled={
          state.journeyEditContentComponent !==
            ActiveJourneyEditContent.Canvas ||
          state.selectedBlock?.__typename === 'VideoBlock'
        }
      />
      <Menu />
    </>
  )
}
