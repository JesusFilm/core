import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { Role } from '../../__generated__/globalTypes'
import { GetUserRole } from '../../__generated__/GetUserRole'
import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateList } from '../../src/components/TemplateList'
import { GET_USER_ROLE } from '../../src/components/JourneyView/JourneyView'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function TemplateIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const router = useRouter()

  const { data } = useQuery<GetUserRole>(GET_USER_ROLE)
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
      <PageWrapper title={t('Templates Admin')} authUser={AuthUser}>
        <TemplateList />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  const { flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
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

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateIndex)
