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
    <Stack justifyContent="center" alignItems="center" spacing={7}>
      <Stack alignItems="center">
        <Typography variant="h4">{t('A Few Questions')}</Typography>
        <Typography variant="body1">{t('Help us serve you better')}</Typography>
      </Stack>
      <FormiumForm
        form={form}
        userId={user.id}
        email={user.email}
        hiddenPageTitle
        submitText={t('Next')}
        submitIcon={<ArrowRightIcon />}
        onSubmit={handleSubmit}
      />
    </Stack>
  )
}
