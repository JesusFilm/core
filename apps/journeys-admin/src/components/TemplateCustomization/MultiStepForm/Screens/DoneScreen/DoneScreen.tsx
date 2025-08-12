import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import dynamic from 'next/dynamic'

import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ShareIcon from '@mui/icons-material/Share'
import EditIcon from '@mui/icons-material/Edit'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import NextImage from 'next/image'
const ShareDrawer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TemplateCustomization/DoneScreen/ShareDrawer" */ './ShareDrawer'
    ).then((mod) => mod.ShareDrawer),
  { ssr: false }
)

export function DoneScreen(): ReactElement {
  const [openShareDrawer, setOpenShareDrawer] = useState<boolean | null>(null)

  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()
  const journeyPath = `/api/preview?slug=${journey?.slug}`
  const href = journey?.slug != null ? journeyPath : undefined

  // needed to preload the drawer chunk to preserve first-open animations
  // only run on hover events
  function handlePreloadShareDrawer(): void {
    setOpenShareDrawer(false)
  }

  function handleShare(): void {
    setOpenShareDrawer(true)
  }

  function handleContinueEditing(): void {
    if (journey?.id != null) void router.push(`/journeys/${journey.id}`)
  }

  return (
    <>
      <Stack alignItems="center" gap={4} sx={{ pb: 4 }}>
        <Typography variant="h4" component="h1">
          {t('Ready!')}
        </Typography>

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

        <Stack gap={4} sx={{ width: { xs: '100%', sm: 300 }, mt: 6 }}>
          <Button
            fullWidth
            variant="contained"
            href={href}
            component={href != null ? 'a' : 'button'}
            target={href != null ? '_blank' : undefined}
            startIcon={<OpenInNewIcon />}
            sx={{
              borderRadius: 3,
              backgroundColor: 'secondary.main'
            }}
          >
            <Typography variant="h6">{t('Preview in new tab')}</Typography>
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleShare}
            onMouseEnter={handlePreloadShareDrawer}
            onFocus={handlePreloadShareDrawer}
            onTouchStart={handlePreloadShareDrawer}
            startIcon={<ShareIcon />}
            sx={{
              borderRadius: 3,
              backgroundColor: 'secondary.main'
            }}
          >
            <Typography variant="h6">{t('Share')}</Typography>
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleContinueEditing}
            startIcon={<EditIcon />}
            sx={{
              borderRadius: 3,
              backgroundColor: 'secondary.main'
            }}
          >
            <Typography variant="h6">{t('Continue Editing')}</Typography>
          </Button>
        </Stack>
      </Stack>
      {openShareDrawer != null && (
        <ShareDrawer
          open={openShareDrawer}
          onClose={() => setOpenShareDrawer(false)}
        />
      )}
    </>
  )
}
