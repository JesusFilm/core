import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import {
  CardsPreview,
  TemplateCardPreviewDialog
} from '../LinksScreen/CardsPreview'

interface GuestPreviewScreenProps {
  handleNext?: (overrideJourneyId?: string) => void
}

export function GuestPreviewScreen({
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

  const [overlayOpen, setOverlayOpen] = useState(false)
  const [clickedStepId, setClickedStepId] = useState<string | null>(null)

  function handleCardClick(step: TreeBlock<StepBlock>): void {
    setClickedStepId(step.id)
    setOverlayOpen(true)
  }

  function handleOverlayClose(): void {
    setOverlayOpen(false)
    setClickedStepId(null)
  }

  const displayDesktop = { xs: 'none', sm: 'block' }
  const displayMobile = { xs: 'block', sm: 'none' }

  function handleContinueToPreview(): void {
    // TODO: Implement continue to preview
  }

  return (
    <Stack
      alignItems="center"
      gap={6}
      sx={{
        px: { xs: 2, sm: 18 },
        width: '100%',
        textAlign: 'center'
      }}
    >
      <Stack alignItems="center" sx={{ pb: 1 }}>
        <Typography
          variant="h3"
          display={displayDesktop}
          gutterBottom
          sx={{
            mb: { xs: 0, sm: 2 }
          }}
        >
          {t('Almost there!')}
        </Typography>
        <Typography
          variant="h5"
          display={displayMobile}
          gutterBottom
          sx={{
            mb: { xs: 0, sm: 2 }
          }}
        >
          {t('Almost there!')}
        </Typography>
        <Typography
          variant="subtitle2"
          display={displayDesktop}
          color="text.secondary"
          fontWeight={400}
        >
          {t(
            'This content contains buttons linking to external sites. Check them and update the links below.'
          )}
        </Typography>
        <Typography
          variant="body2"
          display={displayMobile}
          color="text.secondary"
        >
          {t('Tap on a card to zoom it in')}
        </Typography>
      </Stack>
      <Typography variant="subtitle2" color="text.secondary">
        &quot;{journey?.title ?? ''}&quot;
      </Typography>
      <CardsPreview steps={steps} onCardClick={handleCardClick} />
      {overlayOpen && (
        <TemplateCardPreviewDialog
          open={overlayOpen}
          onClose={handleOverlayClose}
          steps={steps}
          initialStepId={clickedStepId}
        />
      )}
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
          display={displayMobile}
        >
          {t(
            "To keep going, save your progress, customise media, and get a sharing link, you'll need an account."
          )}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          display={displayDesktop}
        >
          {t(
            "To keep going, save your progress, customise media, and get a sharing link, you'll need an account."
          )}
        </Typography>
        <CustomizeFlowNextButton
          label={t('Continue with account')}
          onClick={handleContinueToPreview}
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
    </Stack>
  )
}
