import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { AccountCheckDialog } from '@core/journeys/ui/TemplateView/AccountCheckDialog'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { CardsPreview } from '../LinksScreen/CardsPreview'

interface GuestPreviewScreenProps {
  handleScreenNavigation?: (screen: CustomizationScreen) => void
}

export function GuestPreviewScreen({
  handleScreenNavigation
}: GuestPreviewScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()
  const [openAccountDialog, setOpenAccountDialog] = useState(false)

  const steps = useMemo(
    () =>
      journey != null
        ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
        : [],
    [journey]
  )

  const displayDesktop = { xs: 'none', sm: 'block' }
  const displayMobile = { xs: 'block', sm: 'none' }

  function handleContinueToPreview(): void {}

  function handleSignIn(login: boolean): void {
    if (journey?.id == null) return

    const domain =
      process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? window.location.origin
    const baseUrl = `${domain}/templates/${journey.id}/customize`
    const url = `${baseUrl}?createNew=true&screen=social`

    void router.push(
      {
        pathname: '/users/sign-in',
        query: {
          redirect: url,
          login
        }
      },
      undefined,
      {
        shallow: true
      }
    )
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
      <CardsPreview steps={steps} />
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
          sx={{ mx: 'auto', display: 'block' }}
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
