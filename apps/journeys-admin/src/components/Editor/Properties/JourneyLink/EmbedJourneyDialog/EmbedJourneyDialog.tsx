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
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

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

  // this should match apps/journeys/pages/api/oembed.ts
  const providerUrl = `https://${
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'your.nextstep.is'
  }`
  const embedUrl = `${providerUrl}/embed/${journey?.slug as string}`

  // Self-closing iframe tag breaks embed on WordPress
  const iframeLink = `<iframe src="${embedUrl}" frameborder="0" allow="fullscreen; autoplay" allowfullscreen></iframe>`

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
      testId="EmbedJourneyDialog"
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
              expandIcon={<ChevronDownIcon color="secondary" />}
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
