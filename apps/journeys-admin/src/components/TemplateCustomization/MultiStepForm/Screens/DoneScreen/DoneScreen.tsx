import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TemplateCardPreviewItem } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreviewItem'
import { transformer } from '@core/journeys/ui/transformer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import ArrowRightContained1Icon from '@core/shared/ui/icons/ArrowRightContained1'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { ShareItem } from '../../../../Editor/Toolbar/Items/ShareItem'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'

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

  const steps = transformer(journey?.blocks ?? []) as Array<
    TreeBlock<StepBlock>
  >

  function handleGoToProjectsDashboard(): void {
    if (journey?.id != null) void router.push('/')
  }

  return (
    <Stack alignItems="center" sx={{ pb: 4, px: { xs: 4, sm: 18 } }}>
      <Typography
        variant="h4"
        gutterBottom
        display={{ xs: 'none', sm: 'block' }}
        sx={{ mb: { xs: 0, sm: 2 } }}
      >
        {t('Ready to Share!')}
      </Typography>
      <Typography
        variant="h6"
        display={{ xs: 'block', sm: 'none' }}
        gutterBottom
        sx={{ mb: { xs: 0, sm: 2 } }}
      >
        {t('Ready to Share!')}
      </Typography>
      <Typography
        color="text.secondary"
        align="center"
        variant="subtitle2"
        display={{ xs: 'none', sm: 'block' }}
        sx={{
          maxWidth: { xs: '100%', sm: '90%' },
          pb: 6
        }}
      >
        {t('Share your unique link on any platform.')}
      </Typography>
      <Typography
        color="text.secondary"
        align="center"
        variant="body2"
        display={{ xs: 'block', sm: 'none' }}
        sx={{
          maxWidth: { xs: '100%', sm: '90%' },
          pb: 4
        }}
      >
        {t('Share your unique link on any platform.')}
      </Typography>

      {steps.length > 0 && (
        <TemplateCardPreviewItem step={steps[0]} variant="preview" />
      )}

      <Stack
        gap={4}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          width: { xs: '100%', sm: 300 },
          mt: 6
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Button
            data-testid="DoneScreenPreviewButton"
            fullWidth
            variant="outlined"
            color="secondary"
            href={href}
            component={href != null ? 'a' : 'button'}
            target={href != null ? '_blank' : undefined}
            startIcon={<Play3Icon />}
            sx={{
              borderRadius: 3,
              height: '41px'
            }}
          >
            <Typography variant="subtitle2">{t('Preview')}</Typography>
          </Button>
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            '& button': { width: '100% !important' }
          }}
        >
          <ShareItem variant="button" journey={journey} buttonVariant="icon" />
        </Box>
      </Stack>
      <Button
        data-testid="ProjectsDashboardButton"
        onClick={handleGoToProjectsDashboard}
        endIcon={<ArrowRightContained1Icon />}
        sx={{ mt: 4 }}
      >
        <Typography variant="subtitle2">
          {t('Go To Projects Dashboard')}
        </Typography>
      </Button>
    </Stack>
  )
}
