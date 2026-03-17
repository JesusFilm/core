import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import i18nConfig from '../../next-i18next.config'
import { OnboardingPageWrapper } from '../../src/components/OnboardingPageWrapper'
import { SignIn } from '../../src/components/SignIn'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToApp,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

export default function SignInPage(): ReactElement {
  const { user } = useAuth()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <NextSeo title={t('Sign In')} />
      <OnboardingPageWrapper
        title={t('Create New Account or Log in')}
        emailSubject={t('A question about sign in')}
        user={user}
      >
        <SignIn />
      </OnboardingPageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens != null) {
    const user = toUser(tokens)

    const { redirect } = await initAndAuthApp({
      user,
      locale: ctx.locale,
      resolvedUrl: ctx.resolvedUrl
    })

    if (redirect != null) return { redirect }

    return redirectToApp(ctx)
  }

  return {
    props: {
      ...(await serverSideTranslations(
        ctx.locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
}
