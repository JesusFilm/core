import { gql, useMutation } from '@apollo/client'
import { Form } from '@formium/client'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FormiumForm } from '@core/shared/ui/FormiumForm'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { JourneyProfileOnboardingFormComplete } from '../../../__generated__/JourneyProfileOnboardingFormComplete'

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

  async function handleSubmit(): Promise<void> {
    await journeyProfileOnboardingFormComplete()
    await router?.push({
      pathname: '/teams/new',
      query: { redirect: router.query.redirect }
    })
  }

  return (
    <Stack justifyContent="center" spacing={7}>
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
