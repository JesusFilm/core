import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import TransformIcon from '@core/shared/ui/icons/Transform'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../__generated__/JourneyFields'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  journey?: JourneyFromContext | JourneyFromLazyQuery
  hostname?: string
  onEditUrlClick: () => void
  onEmbedJourneyClick: () => void
  onQrCodeClick: () => void
}

/**
 * ShareDialog component displays sharing options for journeys including URL copy, edit URL, embed, and QR code.
 * Follows the same pattern as other dialogs in the application with parent-managed state.
 *
 * @param {ShareDialogProps} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {() => void} props.onClose - Function to close the dialog
 * @param {(JourneyFromContext | JourneyFromLazyQuery)} [props.journey] - Journey data for sharing
 * @param {string} [props.hostname] - Custom domain hostname
 * @param {() => void} props.onEditUrlClick - Handler for edit URL button click
 * @param {() => void} props.onEmbedJourneyClick - Handler for embed journey button click
 * @param {() => void} props.onQrCodeClick - Handler for QR code button click
 * @returns {ReactElement} Share dialog with sharing options
 */
export function ShareDialog({
  open,
  onClose,
  journey,
  hostname,
  onEditUrlClick,
  onEmbedJourneyClick,
  onQrCodeClick
}: ShareDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog open={open} onClose={onClose}>
      {journey == null ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={120}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Stack direction="column" spacing={4}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Share This Journey')}
          </Typography>
          <CopyTextField
            value={
              journey?.slug != null
                ? `${
                    hostname != null
                      ? `https://${hostname}`
                      : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                        'https://your.nextstep.is')
                  }/${journey?.slug}`
                : undefined
            }
          />
          <Stack direction="row" spacing={6}>
            <Button
              onClick={onEditUrlClick}
              size="small"
              startIcon={<Edit2Icon />}
              disabled={journey == null}
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {t('Edit URL')}
            </Button>
            <Button
              onClick={onEmbedJourneyClick}
              size="small"
              startIcon={<Code1Icon />}
              disabled={journey == null}
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {t('Embed Journey')}
            </Button>
            <Button
              onClick={onQrCodeClick}
              size="small"
              startIcon={<TransformIcon />}
              disabled={journey == null}
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {t('QR Code')}
            </Button>
          </Stack>
        </Stack>
      )}
    </Dialog>
  )
}
