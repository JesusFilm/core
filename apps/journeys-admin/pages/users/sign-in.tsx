import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import i18nConfig from '../../next-i18next.config'
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
})(async ({ locale, req, query, params, resolvedUrl }) => {
  console.log('sign in page ---', req.url, query, params, resolvedUrl)

  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
})

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP
})(SignInPage)
