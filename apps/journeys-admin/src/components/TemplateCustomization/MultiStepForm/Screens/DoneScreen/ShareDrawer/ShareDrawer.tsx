import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import NextImage from 'next/image'
import { useTranslation } from 'react-i18next'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import X2Icon from '@core/shared/ui/icons/X2'

interface ShareDrawerProps {
  open: boolean
  onClose: () => void
}

export function ShareDrawer({ open, onClose }: ShareDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  return (
    <Drawer open={open} anchor="bottom">
      <Stack alignItems="center" gap={4} sx={{ pb: 4, height: '100svh' }}>
        <Stack direction="row" justifyContent="flex-end" width="100%">
          <IconButton aria-label="close-share-drawer" onClick={onClose}>
            <X2Icon />
          </IconButton>
        </Stack>

        <Typography variant="h4">{t('Share!')}</Typography>

        <Box
          sx={{
            width: { xs: 300 },
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: 3,
            p: 2,
            mt: 6
          }}
        >
          <Box sx={{ height: 160, position: 'relative' }}>
            <NextImage
              src={journey?.primaryImageBlock?.src ?? ''}
              alt={journey?.seoTitle ?? ''}
              fill
              objectFit="cover"
              style={{
                borderRadius: 2
              }}
            />
          </Box>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {journey?.seoTitle ?? journey?.displayTitle ?? ''}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {journey?.seoDescription ?? ''}
          </Typography>
        </Box>

        {/* <Stack gap={4} sx={{ width: { xs: '100%', sm: 300 }, mt: 6 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 3,
              backgroundColor: 'secondary.main'
            }}
          >
            <Typography variant="h6">{t('Copy link')}</Typography>
          </Button>

          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 3,
              backgroundColor: 'secondary.main'
            }}
          >
            <Typography variant="h6">{t('Generate QR code')}</Typography>
          </Button>

          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: 3,
              backgroundColor: 'secondary.main'
            }}
          >
            <Typography variant="h6">{t('Embed Code')}</Typography>
          </Button>
        </Stack> */}
      </Stack>
    </Drawer>
  )
}
