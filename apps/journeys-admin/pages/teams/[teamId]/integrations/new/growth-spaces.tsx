import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { GrowthSpacesSettings } from '../../../../../src/components/GrowthSpacesSettings'
import { PageWrapper } from '../../../../../src/components/PageWrapper'
import { initAndAuthApp } from '../../../../../src/libs/initAndAuthApp'

function GrowthSpacesConfigPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  return (
    <>
      <NextSeo title={t('Growth Spaces')} />
      <PageWrapper title={t('Growth Spaces')} user={user} backHrefHistory>
        <GrowthSpacesSettings />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(GrowthSpacesConfigPage)
