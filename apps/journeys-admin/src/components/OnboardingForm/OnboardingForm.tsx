import { gql, useMutation } from '@apollo/client'
import { Form } from '@formium/client'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { FormiumForm } from '@core/shared/ui/FormiumForm'

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

  const [journeyProfileOnboardingFormComplete] =
    useMutation<JourneyProfileOnboardingFormComplete>(
      JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE
    )

  async function handleClick(): Promise<void> {
    await journeyProfileOnboardingFormComplete()
    await router?.push('/teams/new')
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
        handleClick={handleClick}
      />
    </Box>
  )
}
