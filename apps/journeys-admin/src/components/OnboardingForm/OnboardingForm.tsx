import { gql, useMutation } from '@apollo/client'
import { Form } from '@formium/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FormiumForm } from '@core/shared/ui/FormiumForm'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { JourneyProfileOnboardingFormComplete } from '../../../__generated__/JourneyProfileOnboardingFormComplete'
import { useTeam } from '../Team/TeamProvider'

export const JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE = gql`
  mutation JourneyProfileOnboardingFormComplete {
    journeyProfileOnboardingFormComplete {
      id
    }
  }
`

interface OnboardingFormProps {
  form: Form
  user: User
}

export function OnboardingForm({
  form,
  user
}: OnboardingFormProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

  const [journeyProfileOnboardingFormComplete] =
    useMutation<JourneyProfileOnboardingFormComplete>(
      JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE
    )

  const { activeTeam } = useTeam()

  async function handleSubmit(): Promise<void> {
    await journeyProfileOnboardingFormComplete()
    console.log(activeTeam)
    if (activeTeam != null) {
      const redirect =
        router.query.redirect != null
          ? new URL(
              `${window.location.origin}${router.query.redirect as string}`
            )
          : '/?onboarding=true'
      await router.push(redirect)
    } else {
      await router?.push({
        pathname: '/teams/new',
        query: { redirect: router.query.redirect }
      })
    }
  }

  return (
    <Stack justifyContent="center" alignItems="center" spacing={7}>
      <Stack alignItems="center">
        <Typography variant="h4">{t('A Few Questions')}</Typography>
        <Typography variant="body1">{t('Help us serve you better')}</Typography>
      </Stack>
      <ThemeProvider
        themeName={ThemeName.base}
        themeMode={ThemeMode.light}
        nested
      >
        <FormiumForm
          form={form}
          userId={user.id}
          email={user.email}
          hideHeader
          headerAsPageTitle
          submitText={t('Next')}
          submitIcon={<ArrowRightIcon />}
          onSubmit={handleSubmit}
        />
      </ThemeProvider>
    </Stack>
  )
}
