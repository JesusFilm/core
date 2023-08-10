import VisibilityIcon from '@mui/icons-material/Visibility'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { DuplicateBlock } from '../../DuplicateBlock'

import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  const { journey } = useJourney()
  const { state } = useEditor()

  return (
    <>
      <Chip
        icon={<VisibilityIcon />}
        label="Preview"
        component="a"
        href={`/api/preview?slug=${journey?.slug ?? ''}`}
        target="_blank"
        variant="outlined"
        clickable
        sx={{
          display: {
            xs: 'none',
            md: 'flex'
          }
        }}
      />
      <IconButton
        aria-label="Preview"
        href={`/api/preview?slug=${journey?.slug ?? ''}`}
        target="_blank"
        disabled={journey == null}
        sx={{
          display: {
            xs: 'flex',
            md: 'none'
          }
        }}
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
          state.journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
        }
      />
      <Menu />
    </>
  )
}
