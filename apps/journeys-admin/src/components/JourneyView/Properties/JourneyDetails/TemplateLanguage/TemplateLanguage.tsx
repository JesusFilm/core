import { ReactElement, useState } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import CreateRoundedIcon from '@mui/icons-material/CreateRounded'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { LanguageDialog } from '../../../Menu/LanguageDialog'

interface TemplateLanguageProps {
  isPublisher?: boolean
}

export function TemplateLanguage({
  isPublisher
}: TemplateLanguageProps): ReactElement {
  const { journey } = useJourney()
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: smUp ? 'space-between' : 'center'
        }}
      >
        {journey != null ? (
          <Typography variant="body2">
            {journey.language.name.find((primary) => primary)?.value}
          </Typography>
        ) : (
          <Skeleton variant="text" width="40%" />
        )}
        {isPublisher === true && (
          <IconButton size="small" onClick={() => setShowLanguageDialog(true)}>
            <CreateRoundedIcon sx={{ m: 1 }} />
          </IconButton>
        )}
      </Box>
      <LanguageDialog
        open={showLanguageDialog}
        onClose={() => setShowLanguageDialog(false)}
      />
    </>
  )
}
