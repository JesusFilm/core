import Stack from '@mui/material/Stack'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { GrowthSpacesIntegrationDetails } from '../../../../src/components/GrowthSpaces'
import { HelpScoutBeacon } from '../../../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../../../src/components/PageWrapper'
import { initAndAuthApp } from '../../../../src/libs/initAndAuthApp'

function IntegrationPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  return (
    <>
      <NextSeo title={t('Growth Spaces')} />
      <PageWrapper
        title={t('Growth Spaces')}
        user={user}
        backHrefHistory
        mainHeaderChildren={
          <Stack
            direction="row"
            justifyContent="flex-end"
            flexGrow={1}
            alignItems="center"
            gap={3}
            sx={{
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          >
            <HelpScoutBeacon
              userInfo={{
                name: user?.displayName ?? '',
                email: user?.email ?? ''
              }}
            />
          </Stack>
        }
      >
        <GrowthSpacesIntegrationDetails />
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
})(IntegrationPage)
