import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { AiBuilder } from '../src/components/AiBuilder'
import { PageWrapper } from '../src/components/PageWrapper'
import { useAuth } from '../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../src/libs/initAndAuthApp'

export default function AiBuilderPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('AI Builder')} />
      <PageWrapper title={t('AI Builder')} user={user ?? undefined}>
        <AiBuilder />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations
    }
  }
}
