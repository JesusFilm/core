import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { Dialog } from '../../../Dialog'
import { EmbedCardPreview } from './EmbedCardPreview'

interface EmbedJourneyDialogProps {
  open: boolean
  onClose: () => void
}

export function EmbedJourneyDialog({
  open,
  onClose
}: EmbedJourneyDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()

  const iframeLink = `<iframe src=${
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'your.nextstep.is'
  }/embed/${journey?.slug as string} />`

  const handleSubmit = async (): Promise<void> => {
    await navigator.clipboard.writeText(iframeLink ?? '')
    enqueueSnackbar('Embed Code Coppied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  // update according to design when design is finished
  return (
    <Dialog
      open={open}
      handleClose={onClose}
      dialogTitle={{
        title: 'Embed journey',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleSubmit,
        submitLabel: 'Copy Embed Code'
      }}
      divider={true}
    >
      <Stack direction="row" sx={{ height: 290 }}>
        <EmbedCardPreview />
        <Stack
          direction="column"
          spacing={2}
          sx={{ justifyContent: 'space-between' }}
        >
          <TextField
            id="embed-url"
            multiline
            maxRows={5}
            defaultValue={iframeLink}
            disabled={true}
          />
          <Typography variant="body1">
            {t(
              'By embedding a Journey to your site, you agree to the Terms and Agreement'
            )}
          </Typography>
        </Stack>
      </Stack>
    </Dialog>
  )
}
