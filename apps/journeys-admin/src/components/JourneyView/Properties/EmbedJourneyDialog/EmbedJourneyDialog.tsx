import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
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

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const iframeLink = `<iframe src=${process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'your.nextstep.is'
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
        title: 'Embed journey'
      }}
      dialogAction={{
        onSubmit: handleSubmit,
        submitLabel: 'Copy Code',
        closeLabel: 'Cancel'
      }}
      divider={!smUp}
    >
      <Stack direction={smUp ? 'row' : 'column'} spacing={smUp ? 0 : 2} sx={{ height: 290 }}>
        <EmbedCardPreview />
        {/* {smUp ? (
        ) : (
          <Box
            sx={{
              mx: 2,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <EmbedCardPreview />
          </Box>
        )} */}
        <Stack
          direction="column"
          spacing={smUp ? 0 : 4}
          sx={{ justifyContent: 'space-between' }}
        >
          <TextField
            id="embed-url"
            multiline
            maxRows={smUp ? 8 : 3}
            defaultValue={iframeLink}
            disabled={true}
          />
          <Typography variant="caption">
            {t('By embedding a Journey to your site, you agree to the ')}
            <Link
              href="https://www.cru.org/us/en/about/terms-of-use.html"
              underline="none"
              target="_blank"
              rel="noopener"
              color="#0041B2"
            >
              {t('Terms and Agreement')}
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Dialog>
  )
}
