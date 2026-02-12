import Box from '@mui/material/Box'
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

  function handleContinueToPreview(): void {
    setOpenAccountDialog(true)
  }

  function handleSignIn(login: boolean): void {
    const domain =
      process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? window.location.origin
    const baseUrl = `${domain}/templates/${journey?.id ?? ''}/customize`
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
        width: '100%'
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
          align="center"
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
          align="center"
        >
          {t('Tap on a card to zoom it in')}
        </Typography>
      </Stack>
      <Typography variant="subtitle2" align="center" color="text.secondary">
        &quot;{journey?.title ?? ''}&quot;
      </Typography>
      <CardsPreview steps={steps} />
      <Box
        sx={{
          width: '100%',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
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
          sx={{ width: '100%', backgroundColor: 'grey.900', mt: 0 }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ fontStyle: 'italic' }}
        >
          {t('100% FREE. No payment required.')}
        </Typography>
      </Box>
      <AccountCheckDialog
        open={openAccountDialog}
        onClose={() => setOpenAccountDialog(false)}
        handleSignIn={handleSignIn}
      />
    </Stack>
  )
}
