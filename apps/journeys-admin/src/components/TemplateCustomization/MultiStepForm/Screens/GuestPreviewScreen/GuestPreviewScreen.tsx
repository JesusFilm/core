import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'
import { buildCustomizeUrl } from '../../../utils/customizationRoutes'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { getNextCustomizeScreen } from '../../../utils/getNextCustomizeScreen'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { CardsPreview } from '../LinksScreen/CardsPreview'
import { TemplateCardPreviewDialog } from '../LinksScreen/CardsPreview/TemplateCardPreviewDialog'
import { ScreenWrapper } from '../ScreenWrapper'

interface GuestPreviewScreenProps {
  screens: CustomizationScreen[]
  handleNext?: (overrideJourneyId?: string) => void
}

export function GuestPreviewScreen({
  screens,
  handleNext
}: GuestPreviewScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()

  const steps = useMemo(
    () =>
      journey != null
        ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
        : [],
    [journey]
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [clickedStepId, setClickedStepId] = useState<string | null>(null)

  function handleCardClick(step: TreeBlock<StepBlock>): void {
    setClickedStepId(step.id)
    setDialogOpen(true)
  }

  function handleDialogClose(): void {
    setDialogOpen(false)
    setClickedStepId(null)
  }

  function handleContinueWithAccount(): void {
    const nextScreen = getNextCustomizeScreen(screens, 'guestPreview')
    const redirectUrl =
      nextScreen != null
        ? buildCustomizeUrl(journey?.id, nextScreen, undefined)
        : '/'

    void router.push({
      pathname: '/users/sign-in',
      query: { redirect: redirectUrl }
    })
  }

  return (
    <ScreenWrapper
      title={t('Almost there!')}
      subtitle={t(
        'This content contains buttons linking to external sites. Check them and update the links below.'
      )}
      mobileSubtitle={t('Tap on a card to zoom it in')}
    >
      <Typography variant="subtitle2" color="text.secondary">
        &quot;{journey?.title ?? ''}&quot;
      </Typography>
      <CardsPreview steps={steps} onCardClick={handleCardClick} />
      <TemplateCardPreviewDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        steps={steps}
        initialStepId={clickedStepId}
      />
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: 2,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          display={{ xs: 'block', sm: 'none' }}
        >
          {t(
            "To keep going, save your progress, customize media, and get a sharing link, you'll need an account."
          )}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          display={{ xs: 'none', sm: 'block' }}
        >
          {t(
            "To keep going, save your progress, customize media, and get a sharing link, you'll need an account."
          )}
        </Typography>
        <CustomizeFlowNextButton
          label={t('Continue with account')}
          onClick={handleContinueWithAccount}
          ariaLabel={t('Continue with account')}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            backgroundColor: 'secondary.dark',
            mt: 0
          }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic', fontWeight: 700 }}
        >
          {t('100% FREE. No payment required.')}
        </Typography>
      </Card>
    </ScreenWrapper>
  )
}
