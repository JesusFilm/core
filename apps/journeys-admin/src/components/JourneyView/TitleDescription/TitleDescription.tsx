import { ReactElement, useState } from 'react'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import CreateRoundedIcon from '@mui/icons-material/CreateRounded'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TitleDescriptionDialog } from './TitleDescriptionDialog'

interface TitleDescriptionProps {
  isPublisher?: boolean
}

export function TitleDescription({
  isPublisher
}: TitleDescriptionProps): ReactElement {
  const { journey } = useJourney()

  const [showTitleDescriptionDialog, setShowTitleDescriptionDialog] =
    useState(false)

  const handleUpdateTitleDescription = (): void => {
    setShowTitleDescriptionDialog(true)
  }

  return (
    <>
      <Stack direction="column" spacing={4}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            display: journey != null ? 'flex' : 'block'
          }}
        >
          <Typography variant={journey?.template === true ? 'h1' : 'h4'}>
            {journey != null ? (
              journey.title
            ) : (
              <Skeleton variant="text" width="60%" />
            )}
          </Typography>
          {isPublisher === true && journey?.template === true && (
            <IconButton
              data-testid="EditTitleDescription"
              size="small"
              onClick={handleUpdateTitleDescription}
            >
              <CreateRoundedIcon />
            </IconButton>
          )}
        </Stack>
        <Typography variant={journey?.template === true ? 'body2' : 'body1'}>
          {journey != null ? (
            journey.description
          ) : (
            <Skeleton variant="text" width="80%" />
          )}
        </Typography>
      </Stack>
      <TitleDescriptionDialog
        open={showTitleDescriptionDialog}
        onClose={() => setShowTitleDescriptionDialog(false)}
      />
    </>
  )
}
