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

import { NotificationSwitch } from '../../../../AccessDialog/NotificationSwitch'
import { ShareItem } from '../../../../Editor/Toolbar/Items/ShareItem'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { ScreenWrapper } from '../ScreenWrapper'

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
      <ScreenWrapper
        title={t('Ready to Share!')}
        subtitle={t('Share your unique link on any platform.')}
      >
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
            <ShareItem
              variant="button"
              journey={journey}
              buttonVariant="icon"
            />
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
        <Stack gap={2} sx={{ width: '100%', mt: 4 }}>
          <Typography variant="subtitle1">
            {t('Choose where responses go:')}
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2">
              {t('Send to my email')}
            </Typography>
            <NotificationSwitch journeyId={journey?.id} />
          </Stack>
        </Stack>
      </ScreenWrapper>
    </Stack>
  )
}
