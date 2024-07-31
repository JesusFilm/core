import Box from '@mui/material/Box'
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
import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { ReportsNavigation } from '../../src/components/ReportsNavigation'
import { VisitorsList } from '../../src/components/VisitorsList'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function ReportsVisitorsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  return (
    <>
      <NextSeo title={t('Visitors Analytics')} />
      <PageWrapper
        title={t('Visitors Analytics')}
        user={user}
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
              <HelpScoutBeacon />
            </Box>
          </Stack>
        }
      >
        <VisitorsList />
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
})(ReportsVisitorsPage)
