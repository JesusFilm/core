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
import { ScreenWrapper } from '../ScreenWrapper'

export function DoneScreen(): ReactElement {
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
    <ScreenWrapper
      title={t('Ready to share!')}
      subtitle={t('Share your unique link on any platform.')}
      footer={
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
      }
    >
      {steps.length > 0 && (
        <TemplateCardPreviewItem step={steps[0]} variant="preview" />
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          width: '100%',
          mt: 6,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'center',
          gap: { xs: 3, sm: 2 }
        }}
      >
        <Button
          data-testid="DoneScreenPreviewButton"
          variant="outlined"
          color="secondary"
          href={href}
          component={href != null ? 'a' : 'button'}
          target={href != null ? '_blank' : undefined}
          startIcon={<Play3Icon />}
          sx={{
            borderWidth: 2,
            borderRadius: 2,
            height: 48,
            width: { xs: '100%', sm: 216 },
            borderColor: 'secondary.light'
          }}
        >
          <Typography variant="subtitle2">{t('Preview')}</Typography>
        </Button>
        <ShareItem
          variant="button"
          journey={journey}
          buttonVariant="icon"
          buttonProps={{
            sx: {
              width: { xs: '100%', sm: 216 },
              height: 48,
              borderRadius: 2
            }
          }}
        />
       <NotificationSwitch journeyId={journey?.id} />
      </Stack>
    </ScreenWrapper>
  )
}
