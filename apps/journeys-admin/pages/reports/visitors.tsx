import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'
import { VisitorsList } from '../../src/components/VisitorsList'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

export default function ReportsVisitorsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('Visitors Analytics')} />
      <PageWrapper
        title={t('Visitors Analytics')}
        user={user ?? undefined}
        mainHeaderChildren={
          <Stack
            direction="row"
            justifyContent="flex-end"
            flexGrow={1}
            alignItems="center"
            gap={3}
          >
            <ReportsNavigation destination="journey" />
            <Box
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
            </Box>
          </Stack>
        }
      >
        <VisitorsList />
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
