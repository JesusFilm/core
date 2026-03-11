import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { JourneysReportType } from '../../__generated__/globalTypes'
import { MemoizedDynamicReport } from '../../src/components/DynamicPowerBiReport'
import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

export default function ReportsJourneysPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('Journeys Analytics')} />
      <PageWrapper
        title={t('Journeys Analytics')}
        user={user ?? undefined}
        mainHeaderChildren={
          <Stack
            direction="row"
            justifyContent="flex-end"
            flexGrow={1}
            alignItems="center"
            gap={3}
          >
            <ReportsNavigation destination="visitor" />
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
        <Box sx={{ height: 'calc(100vh - 48px)' }}>
          <MemoizedDynamicReport reportType={JourneysReportType.multipleFull} />
        </Box>
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
