import { Form } from '@formium/client'
import Box from '@mui/material/Box'
import { AuthUser } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { FormiumForm } from '@core/shared/ui/FormiumForm'

interface OnboardingFormProps {
  form: Form
  authUser: AuthUser
}

export function OnboardingForm({
  form,
  authUser
}: OnboardingFormProps): ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <FormiumForm form={form} userId={authUser.id} email={authUser.email} />
    </Box>
  )
}
