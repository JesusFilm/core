import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { TermsAndConditions } from '../../src/components/TermsAndConditions'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useHandleNewAccountRedirect } from '../../src/libs/useRedirectNewAccount'

function TermsAndConditionsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const title = t('Terms and Conditions')
  const { user } = useAuth()

  useHandleNewAccountRedirect()

  return (
    <>
      <NextSeo title={title} />
      <OnboardingPageWrapper
        title={title}
        emailSubject={t('A question about the terms and conditions form')}
        user={user ?? undefined}
      >
        <TermsAndConditions />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)

  const user = toUser(tokens)
  const { redirect, translations, apolloClient } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract(),
      ...translations
    }
  }
}

export default TermsAndConditionsPage
