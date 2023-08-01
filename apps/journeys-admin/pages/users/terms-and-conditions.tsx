import { ReactElement } from 'react'
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { useTranslation } from 'react-i18next'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

import { TermsAndConditions } from '../../src/components/TermsAndConditions'
import { AcceptAllInvites } from '../../__generated__/AcceptAllInvites'
import { ACCEPT_ALL_INVITES } from '..'

function TermsAndConditionsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <NextSeo title={t('Terms and Conditions')} />
      <TermsAndConditions />
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  const { apolloClient, flags, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
  })

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TermsAndConditionsPage)
