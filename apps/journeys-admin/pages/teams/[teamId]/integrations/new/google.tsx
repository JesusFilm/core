import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

import { GoogleCreateIntegration } from '../../../../../src/components/Google'
import { HelpScoutBeacon } from '../../../../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../../../../src/components/PageWrapper'
import { useAuth } from '../../../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../../../src/libs/initAndAuthApp'

export default function GoogleConfigPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('Google')} />
      <PageWrapper
        title={t('Google')}
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
        <GoogleCreateIntegration />
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
