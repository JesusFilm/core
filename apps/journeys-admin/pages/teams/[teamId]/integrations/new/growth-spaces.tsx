import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

import { GrowthSpacesCreateIntegration } from '../../../../../src/components/GrowthSpaces'
import { HelpScoutBeacon } from '../../../../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../../../../src/components/PageWrapper'
import { useAuth } from '../../../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../../../src/libs/initAndAuthApp'

export default function GrowthSpacesConfigPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('Growth Spaces')} />
      <PageWrapper
        title={t('Growth Spaces')}
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
        <GrowthSpacesCreateIntegration />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { redirect, translations, flags } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  if (flags.teamIntegrations !== true)
    return {
      redirect: {
        destination: '/',
        permanent: false
      },
      props: {
        userSerialized: JSON.stringify(user),
        ...translations
      }
    }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations
    }
  }
}
