import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Code1Icon from '@core/shared/ui/icons/Code1'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import TransformIcon from '@core/shared/ui/icons/Transform'
import X2 from '@core/shared/ui/icons/X2'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../__generated__/JourneyFields'

import { LinkTab } from './tabs/LinkTab'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  journey?: JourneyFromContext | JourneyFromLazyQuery
  hostname?: string
  onEditUrlClick: () => void
  onEmbedJourneyClick: () => void
  onQrCodeClick: () => void
}

/**
 * ShareModal component displays sharing options for journeys including URL copy, edit URL, embed, and QR code.
 * Follows the same pattern as other modals in the application with parent-managed state.
 * Uses Dialog on desktop and SwipeableDrawer (sliding from bottom) on mobile for responsive design.
 *
 * @param {ShareModalProps} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {() => void} props.onClose - Function to close the modal
 * @param {(JourneyFromContext | JourneyFromLazyQuery)} [props.journey] - Journey data for sharing
 * @param {string} [props.hostname] - Custom domain hostname
 * @param {() => void} props.onEditUrlClick - Handler for edit URL button click
 * @param {() => void} props.onEmbedJourneyClick - Handler for embed journey button click
 * @param {() => void} props.onQrCodeClick - Handler for QR code button click
 * @returns {ReactElement} Share modal with sharing options
 */
export function ShareModal({
  open,
  onClose,
  journey,
  hostname,
  onEmbedJourneyClick,
  onQrCodeClick
}: ShareModalProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [value, setValue] = useState('0')
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const shareContent = (
    <>
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
          <TabContext value={value}>
            <Tabs variant="fullWidth" value={value} onChange={handleChange}>
              <Tab icon={<LinkAngled />} label={t('Link')} value="0" />
              <Tab icon={<TransformIcon />} label={t('QR Code')} value="1" />
              <Tab icon={<Code1Icon />} label={t('Embed')} value="2" />
            </Tabs>

            <LinkTab journey={journey} hostname={hostname} />

            <TabPanel value="1">
              <Button
                onClick={onQrCodeClick}
                size="small"
                startIcon={<TransformIcon />}
                disabled={journey == null}
                fullWidth
              >
                {t('Generate QR Code')}
              </Button>
            </TabPanel>

            <TabPanel value="2">
              <Button
                onClick={onEmbedJourneyClick}
                size="small"
                startIcon={<Code1Icon />}
                disabled={journey == null}
                fullWidth
              >
                {t('Get Embed Code')}
              </Button>
            </TabPanel>
          </TabContext>
        </Stack>
      )}
    </>
  )

  if (mdUp) {
    // Desktop: Use Dialog
    return (
      <Dialog
        open={open}
        onClose={onClose}
        dialogTitle={{ title: t('Share This Journey'), closeButton: true }}
        sx={{
          '& .MuiDialogContent-root': {
            paddingBottom: 0
          }
        }}
      >
        {shareContent}
      </Dialog>
    )
  }

  // Mobile: Use SwipeableDrawer with built-in behavior
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => undefined}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          height: '70vh'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Mobile Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            px: 4
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('Share This Journey')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X2 />
          </IconButton>
        </Box>

        {shareContent}
      </Box>
    </SwipeableDrawer>
  )
}
