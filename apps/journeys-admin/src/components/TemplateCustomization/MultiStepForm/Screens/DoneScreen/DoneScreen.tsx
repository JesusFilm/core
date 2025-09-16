import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import NextImage from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { ShareItem } from '../../../../Editor/Toolbar/Items/ShareItem'

interface DoneScreenProps {
  handleScreenNavigation?: (screen: CustomizationScreen) => void
}

export function DoneScreen({
  handleScreenNavigation
}: DoneScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()
  const journeyPath = `/api/preview?slug=${journey?.slug}`
  const href = journey?.slug != null ? journeyPath : undefined

  function handleContinueEditing(): void {
    if (journey?.id != null) void router.push(`/journeys/${journey.id}`)
  }

  return (
    <Stack alignItems="center" sx={{ pb: 4, px: 4 }}>
      <Typography
        component="h1"
        variant="h4"
        gutterBottom
        display={{ xs: 'none', sm: 'block' }}
        sx={{ mb: { xs: 0, sm: 2 } }}
      >
        {t("It's Ready!")}
      </Typography>
      <Typography
        component="h1"
        variant="h6"
        display={{ xs: 'block', sm: 'none' }}
        gutterBottom
        sx={{ mb: { xs: 0, sm: 2 } }}
      >
        {t("It's Ready!")}
      </Typography>
      <Typography
        color="text.secondary"
        align="center"
        variant="h6"
        display={{ xs: 'none', sm: 'block' }}
        sx={{
          maxWidth: { xs: '100%', sm: '90%' }
        }}
      >
        {t(
          'If you’re happy with it, preview and share now. Want to update images or videos? Keep customising.'
        )}
      </Typography>
      <Typography
        color="text.secondary"
        align="center"
        variant="body2"
        display={{ xs: 'block', sm: 'none' }}
        sx={{
          maxWidth: { xs: '100%', sm: '90%' }
        }}
      >
        {t(
          'If you’re happy with it, preview and share now. Want to update images or videos? Keep customising.'
        )}
      </Typography>
      <Box
        sx={{
          width: 300,
          height: 300,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 3,
          p: 2,
          mt: 6
        }}
      >
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={{
            height: { xs: 185, sm: 210 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {journey?.primaryImageBlock?.src != null ? (
            <NextImage
              src={journey?.primaryImageBlock?.src ?? ''}
              alt={journey?.primaryImageBlock.alt ?? ''}
              fill
              objectFit="cover"
              style={{
                borderRadius: '8px',
                padding: 3
              }}
            />
          ) : (
            <GridEmptyIcon fontSize="large" />
          )}
        </Stack>
        <Stack gap={2} sx={{ mt: { xs: 8, sm: 4 } }}>
          <Typography variant="subtitle1" noWrap>
            {journey?.seoTitle ?? journey?.title ?? ''}
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
            {journey?.seoDescription ?? journey?.description ?? ''}
          </Typography>
        </Stack>
      </Box>

      <Stack
        gap={4}
        sx={{
          width: { xs: '100%', sm: 300 },
          mt: 6
        }}
      >
        <Button
          data-testid="DoneScreenPreviewButton"
          fullWidth
          variant="contained"
          href={href}
          component={href != null ? 'a' : 'button'}
          target={href != null ? '_blank' : undefined}
          sx={{
            borderRadius: 3,
            backgroundColor: 'secondary.main',
            height: '41px'
          }}
        >
          <Typography variant="subtitle2">{t('Preview in New Tab')}</Typography>
        </Button>

        <Box
          sx={{
            width: '100%',
            '& button': { width: '100% !important' }
          }}
        >
          <ShareItem
            variant="button"
            journey={journey}
            buttonVariant="default"
          />
        </Box>

        <Button
          data-testid="DoneScreenContinueEditingButton"
          fullWidth
          variant="contained"
          onClick={handleContinueEditing}
          sx={{
            borderRadius: 3,
            backgroundColor: 'secondary.main',
            height: '41px'
          }}
        >
          <Typography variant="subtitle2">{t('Keep Editing')}</Typography>
        </Button>
      </Stack>
    </Stack>
  )
}
