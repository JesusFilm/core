import { ReactElement } from 'react'
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { SignIn } from '../../src/components/SignIn'

function SignInPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <NextSeo title={t('Sign In')} />
      <SignIn />
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})(async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'apps-journeys-admin',
        'libs-journeys-ui'
      ]))
    }
  }
})

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})(SignInPage)
