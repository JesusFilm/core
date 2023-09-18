import { Form } from '@formium/types'
// import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { ReactElement } from 'react'

import { FormiumForm } from '@core/shared/ui/FormiumForm'

import { formiumClient } from '../../src/libs/formiumClient'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface Props {
  form: Form
}

function OnboardingFormPage({ form }: Props): ReactElement {
  const AuthUser = useAuthUser()
  // const router = useRouter()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <FormiumForm
        formiumClient={formiumClient}
        form={form}
        userId={AuthUser.id}
      />
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

  const form = await formiumClient.getFormBySlug('ns-test')

  return {
    props: {
      flags,
      ...translations,
      form
    }
  }
})

export default withAuthUser<Props>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(OnboardingFormPage)
