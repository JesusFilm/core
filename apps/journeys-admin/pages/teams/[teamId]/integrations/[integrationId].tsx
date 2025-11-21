import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { GoogleIntegrationDetails } from '../../../../src/components/Google'
import { GrowthSpacesIntegrationDetails } from '../../../../src/components/GrowthSpaces'
import { useIntegrationQuery } from '../../../../src/libs/useIntegrationQuery'
import { HelpScoutBeacon } from '../../../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../../../src/components/PageWrapper'
import { initAndAuthApp } from '../../../../src/libs/initAndAuthApp'

function IntegrationPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const { query } = useRouter()
  const { data } = useIntegrationQuery({ teamId: query.teamId as string })
  const selected = data?.integrations.find((i) => i.id === query.integrationId)

  return (
    <>
      <NextSeo title={t('Integration')} />
      <PageWrapper
        title={t('Integration')}
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
        {selected != null && (
          <>
            {selected?.type === 'google' ? (
              <GoogleIntegrationDetails />
            ) : (
              <GrowthSpacesIntegrationDetails />
            )}
          </>
        )}
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
