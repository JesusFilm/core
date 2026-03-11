import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { GoogleIntegrationDetails } from '../../../../src/components/Google'
import { GrowthSpacesIntegrationDetails } from '../../../../src/components/GrowthSpaces'
import { HelpScoutBeacon } from '../../../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../../../src/components/PageWrapper'
import { useAuth } from '../../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../../src/libs/initAndAuthApp'
import { useIntegrationQuery } from '../../../../src/libs/useIntegrationQuery'

export default function IntegrationPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const { query } = useRouter()
  const { data } = useIntegrationQuery({ teamId: query.teamId as string })
  const selected = data?.integrations.find((i) => i.id === query.integrationId)

  return (
    <>
      <NextSeo title={t('Integration')} />
      <PageWrapper
        title={t('Integration')}
        user={user ?? undefined}
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
