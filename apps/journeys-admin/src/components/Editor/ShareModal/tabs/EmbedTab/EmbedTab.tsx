import TabPanel from '@mui/lab/TabPanel'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import Code1Icon from '@core/shared/ui/icons/Code1'
import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../../../__generated__/JourneyFields'
import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'

import { EmbedCardPreview } from './EmbedCardPreview'

interface EmbedTabProps {
  journey?: JourneyFromContext | JourneyFromLazyQuery
}

export function EmbedTab({ journey }: EmbedTabProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  // this should match apps/journeys/pages/api/oembed.ts
  const providerUrl =
    hostname != null
      ? `https://${hostname}`
      : (process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is')
  const embedUrl = `${providerUrl}/embed/${journey?.slug}`

  // Self-closing iframe tag breaks embed on WordPress
  const iframeLink = `<iframe src="${embedUrl}" style="border: 0; width: 360px; height: 640px;" allow="fullscreen; autoplay" allowfullscreen></iframe>`

  const handleCopyCode = async (): Promise<void> => {
    await navigator.clipboard.writeText(iframeLink ?? '')
    enqueueSnackbar(t('Code Copied'), {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <TabPanel value="2" sx={{ padding: 0, pb: 3 }}>
      <Box sx={{ maxHeight: { xs: 'none', sm: 310 }, overflow: 'hidden' }}>
        <Stack direction={smUp ? 'row' : 'column'} spacing={smUp ? 3 : 3}>
          {smUp ? (
            <Box
              sx={{
                padding: 0,
                overflowY: smUp ? 'hidden' : null,
                overflowX: 'hidden',
                borderRadius: 1
              }}
            >
              <EmbedCardPreview journey={journey} />
            </Box>
          ) : (
            <Accordion
              variant="outlined"
              sx={{
                borderRadius: 1,
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
              <AccordionDetails
                sx={{
                  p: 2,
                  pb: 2,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <EmbedCardPreview journey={journey} />
              </AccordionDetails>
            </Accordion>
          )}
          <Stack direction="column" sx={{ flex: 7 }}>
            <TextField
              id="embed-url"
              multiline
              fullWidth
              value={iframeLink}
              variant="standard"
              slotProps={{
                input: {
                  disableUnderline: true,
                  readOnly: true
                }
              }}
              sx={{
                backgroundColor: 'grey.100',
                height: '100%',
                p: 3,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`
              }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Bottom row: Terms text and Copy Code button - Mobile responsive */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1
          }}
        >
          <InformationCircleContained
            sx={{
              fontSize: 24,
              color: 'text.secondary'
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {t('By embedding a Journey to your site, you agree to the ')}
            <Link
              href="https://www.cru.org/us/en/about/terms-of-use.html"
              underline="none"
              target="_blank"
              rel="noopener"
              color="primary.main"
            >
              {t('Terms of agreement')}
            </Link>
            .
          </Typography>
        </Box>

        <Button
          onClick={handleCopyCode}
          variant="contained"
          color="secondary"
          startIcon={<Code1Icon />}
          fullWidth={!smUp}
          sx={{
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {t('Copy Code')}
        </Button>
      </Box>
    </TabPanel>
  )
}
