import { gql, useMutation } from '@apollo/client'
import { Form } from '@formium/client'
import Box from '@mui/material/Box'
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
  authUser: User
}

export function OnboardingForm({
  form,
  authUser
}: OnboardingFormProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

  const [journeyProfileOnboardingFormComplete] =
    useMutation<JourneyProfileOnboardingFormComplete>(
      JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE
    )

  async function handleClick(): Promise<void> {
    await journeyProfileOnboardingFormComplete()
    await router?.push({
      pathname: '/teams/new',
      query: { redirect: router.query.redirect }
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <FormiumForm
        form={form}
        userId={authUser.id}
        email={authUser.email}
        submitText={t('Next')}
        submitIcon={<ArrowRightIcon />}
        handleClick={handleClick}
      />
    </Box>
  )
}
