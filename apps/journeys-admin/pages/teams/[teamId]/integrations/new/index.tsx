import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { PageWrapper } from '../../../../../src/components/PageWrapper'
import { Integrations } from '../../../../../src/components/Team/Integrations'
import { initAndAuthApp } from '../../../../../src/libs/initAndAuthApp'

function IntegrationsIndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  return (
    <>
      <NextSeo title={t('Integrations')} />
      <PageWrapper
        title={t('Integrations')}
        user={user}
        backHrefHistory
        mainBodyPadding={false}
      >
        <Integrations />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { redirect, translations, flags } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  if (flags.teamIntegrations !== true)
    return {
      redirect: {
        destination: '/',
        permanent: false
      },
      props: {
        ...translations
      }
    }

  return {
    props: {
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IntegrationsIndexPage)
