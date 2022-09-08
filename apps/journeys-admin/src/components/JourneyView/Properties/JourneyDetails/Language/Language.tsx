import { ReactElement, useEffect, useState } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import CreateRoundedIcon from '@mui/icons-material/CreateRounded'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { LanguageDialog } from '../../../Menu/LanguageDialog'

interface LanguageProps {
  isPublisher?: boolean
}

export function Language({ isPublisher }: LanguageProps): ReactElement {
  const { journey } = useJourney()
  const theme = useTheme()
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)
  const [localLanguage, setLocalLanguage] = useState<string | undefined>()
  const [nativeLanguage, setNativeLanguage] = useState<string | undefined>()

  useEffect(() => {
    setLocalLanguage(
      journey?.language.name.find(({ primary }) => !primary)?.value
    )
    setNativeLanguage(
      journey?.language.name.find(({ primary }) => primary)?.value
    )
  }, [journey])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          [theme.breakpoints.up('sm')]: {
            justifyContent: 'space-between'
          },
          [theme.breakpoints.down('sm')]: {
            justifyContent: 'center'
          }
        }}
      >
        {journey != null ? (
          <Typography variant="body2" sx={{ ml: 2 }}>
            <span>
              {localLanguage ?? nativeLanguage}
              {localLanguage != null &&
                localLanguage !== nativeLanguage &&
                nativeLanguage && <span>&nbsp;({nativeLanguage})</span>}
            </span>
          </Typography>
        ) : (
          <Skeleton variant="text" width="40px" sx={{ ml: 2 }} />
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
