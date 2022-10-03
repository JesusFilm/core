import { ReactElement, useState } from 'react'
import Button from '@mui/material/Button'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import DeveloperModeRoundedIcon from '@mui/icons-material/DeveloperModeRounded'
import EditIcon from '@mui/icons-material/Edit'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { EmbedJourneyDialog } from './EmbedJourneyDialog'
import { SlugDialog } from './SlugDialog'

export function JourneyLink(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { reports } = useFlags()
  const [showSlugDialog, setShowSlugDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <>
      {smUp && (
        <Typography variant="subtitle2" gutterBottom>
          {t('Journey URL')}
        </Typography>
      )}
      <CopyTextField
        value={
          journey?.slug != null
            ? `${
                process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                'https://your.nextstep.is'
              }/${journey.slug}`
            : undefined
        }
        label={!smUp ? t('Journey URL') : undefined}
        sx={
          !smUp
            ? {
                '.MuiFilledInput-root': {
                  backgroundColor: 'background.paper'
                }
              }
            : undefined
        }
      />
      <Stack direction="row" spacing={6} sx={{ pt: 2 }}>
        <Button
          onClick={() => setShowSlugDialog(true)}
          size="small"
          startIcon={<EditIcon />}
          disabled={journey == null}
        >
          {t('Edit URL')}
        </Button>
        <Button
          onClick={() => setShowEmbedDialog(true)}
          size="small"
          startIcon={<DeveloperModeRoundedIcon />}
          disabled={journey == null}
        >
          {t('Embed Journey')}
        </Button>
      </Stack>
      <SlugDialog
        open={showSlugDialog}
        onClose={() => setShowSlugDialog(false)}
      />
      <EmbedJourneyDialog
        open={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
      />
    </>
  )
}
