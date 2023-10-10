import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Role } from '../../__generated__/globalTypes'
import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateList } from '../../src/components/TemplateList'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useUserRoleQuery } from '../../src/libs/useUserRoleQuery'

function TemplateIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()

  const { data } = useUserRoleQuery()
  useEffect(() => {
    if (
      data != null &&
      data?.getUserRole?.roles?.includes(Role.publisher) !== true
    ) {
      void router.push('/templates')
    }
  }, [data, router])

  return (
    <>
      <NextSeo title={t('Templates Admin')} />
      <PageWrapper title={t('Templates Admin')} user={user}>
        <TemplateList />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { flags, redirect, translations } = await initAndAuthApp({
    user,
    locale
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      flags,
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateIndex)
