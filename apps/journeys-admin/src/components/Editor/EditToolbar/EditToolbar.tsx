import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'

import { DuplicateBlock } from './DuplicateBlock'

import { Analytics } from './Analytics'
import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  const { journey } = useJourney()
  const { state } = useEditor()
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      flexGrow={1}
    >
      {journey != null && (
        <>
          {mdUp && <Analytics journey={journey} variant="button" />}
          <Chip
            icon={<EyeOpenIcon />}
            label="Preview"
            component="a"
            href={`/api/preview?slug=${journey.slug}`}
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
            href={`/api/preview?slug=${journey.slug}`}
            target="_blank"
            sx={{
              display: {
                xs: 'flex',
                md: 'none'
              }
            }}
          >
            <EyeOpenIcon />
          </IconButton>
        </>
      )}

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
    </Stack>
  )
}
