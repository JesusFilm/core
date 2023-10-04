import { Form } from '@formium/types'
import Box from '@mui/material/Box'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { ReactElement } from 'react'

import { formiumClient } from '@core/shared/ui/formiumClient'
import { FormiumForm } from '@core/shared/ui/FormiumForm'

import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface OnboardingFormPageProps {
  form: Form
}

function OnboardingFormPage({ form }: OnboardingFormPageProps): ReactElement {
  const AuthUser = useAuthUser()
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <FormiumForm form={form} userId={AuthUser.id} email={AuthUser.email} />
    </Box>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  if (redirect != null) return { redirect }

  const form = await formiumClient.getFormBySlug('ns-onboarding-form')

  return {
    props: {
      flags,
      ...translations,
      form
    }
  }
})

export default withAuthUser<OnboardingFormPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
