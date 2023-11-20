import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ReactElement, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

const DynamicLanguageDialog = dynamic<{
  open: boolean
  onClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "PropertiesLanguageDialog" */
      '../../../EditToolbar/Menu/LanguageMenuItem/LanguageDialog'
    ).then((mod) => mod.LanguageDialog)
)

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
        data-testid="Language"
      >
        {journey != null ? (
          <Typography variant="body2" sx={{ ml: 2 }}>
            <span>
              {localLanguage ?? nativeLanguage}
              {localLanguage != null &&
                localLanguage !== nativeLanguage &&
                nativeLanguage !== null && (
                  <span>&nbsp;({nativeLanguage})</span>
                )}
            </span>
          </Typography>
        ) : (
          <Skeleton variant="text" width="40px" sx={{ ml: 2 }} />
        )}
        {isPublisher === true && (
          <IconButton size="small" onClick={() => setShowLanguageDialog(true)}>
            <Edit2Icon sx={{ m: 1 }} />
          </IconButton>
        )}
      </Box>
      {showLanguageDialog && (
        <DynamicLanguageDialog
          open={showLanguageDialog}
          onClose={() => setShowLanguageDialog(false)}
        />
      )}
    </>
  )
}
