import VisibilityIcon from '@mui/icons-material/Visibility'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

// import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { DuplicateBlock } from '../../DuplicateBlock'

import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  const { journey } = useJourney()
  const { state } = useEditor()
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      <IconButton
        aria-label="Preview"
        href={`/api/preview?slug=${journey?.slug ?? ''}`}
        target="_blank"
        disabled={journey == null}
      >
        <VisibilityIcon />
        <Typography sx={{ display: mdUp ? 'block' : 'none' }}>
          Preview
        </Typography>
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
