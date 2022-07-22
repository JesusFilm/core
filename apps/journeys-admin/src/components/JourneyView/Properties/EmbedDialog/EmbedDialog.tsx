import { ReactElement, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { Dialog } from '../../../Dialog'
import { EmbedCardPreview } from './EmbedCardPreview'

interface EmbedDialogProps {
  open: boolean
  onClose: () => void
}

export function EmbedDialog({ open, onClose }: EmbedDialogProps): ReactElement {
  const [height, setHeight] = useState('640')
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()

  const iframeLink = `<iframe src=${
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'your.nextstep.is'
  }/embed/${journey?.slug as string} width="400" height=${height} />`

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
      <Stack direction="row" spacing={6}>
        <EmbedCardPreview />
        <Stack direction="column" spacing={2}>
          <TextField
            id="embed-url"
            multiline
            maxRows={5}
            defaultValue={iframeLink}
            disabled={true}
          />
          <FormGroup>
            {/* <FormControlLabel control={<Checkbox />} label="Responsive" /> */}
            <FormControlLabel control={<Checkbox />} label="Custom Size" />
            <TextField
              defaultValue={height}
              size="small"
              onChange={(e) => setHeight(e.target.value)}
            />
          </FormGroup>
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
