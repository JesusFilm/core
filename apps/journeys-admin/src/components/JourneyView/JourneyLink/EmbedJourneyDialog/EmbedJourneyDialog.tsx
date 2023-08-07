import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

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

  // Self-closing iframe tag breaks embed on WordPress
  const iframeLink = `<div style="position: relative; width: 100%; overflow: hidden; padding-top: 150%;"><iframe  id="jfm-iframe" src="${
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'your.nextstep.is'
  }/embed/${
    journey?.slug as string
  }" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 100%; height: 100%; border: none;" allow="fullscreen"></iframe></div><script>window.addEventListener('message', event => { if(event.origin==='https://your.nextstep.is'){ const iframe=document.getElementById('jfm-iframe')
if(event.data === true){ 
iframe.style.position="fixed"
iframe.style.zIndex="999999999999999999999"
} else {
iframe.style.position="absolute"
iframe.style.zIndex="auto"
}}})</script>`

  const handleSubmit = async (): Promise<void> => {
    await navigator.clipboard.writeText(iframeLink ?? '')
    enqueueSnackbar('Code Copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <Stack
        direction={smUp ? 'row' : 'column'}
        spacing={smUp ? 3 : 5}
        sx={{ height: 310, pt: 0, mt: 0 }}
      >
        {smUp ? (
          <Box
            sx={{
              padding: 0,
              overflowY: smUp ? 'hidden' : null,
              overflowX: 'hidden'
            }}
          >
            <EmbedCardPreview />
          </Box>
        ) : (
          <Accordion
            variant="outlined"
            sx={{
              borderRadius: '6px',
              p: 0,
              m: 0
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon color="secondary" />}
              aria-controls="panel-content"
              sx={{
                flexDirection: 'row-reverse'
              }}
            >
              <Typography variant="subtitle2">{t('Show Preview')}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pb: 2, ml: -4 }}>
              <EmbedCardPreview />
            </AccordionDetails>
          </Accordion>
        )}
        <Stack
          direction="column"
          spacing={smUp ? 0 : 4}
          justifyContent="start"
          sx={{ justifyContent: 'space-between' }}
        >
          <TextField
            id="embed-url"
            multiline
            maxRows={smUp ? 8 : 3}
            defaultValue={iframeLink}
            sx={{ backgroundColor: 'rgba(239, 239, 239, 0.4)' }}
          />
          <Typography variant="caption" mt="16px">
            {t('By embedding a Journey to your site, you agree to the ')}
            <Link
              href="https://www.cru.org/us/en/about/terms-of-use.html"
              underline="none"
              target="_blank"
              rel="noopener"
              color="#0041B2"
            >
              {t('Terms of agreement')}
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Dialog>
  )
}
