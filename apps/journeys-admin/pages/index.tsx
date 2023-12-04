import Stack from '@mui/material/Stack'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { AuthAction, useUser, withUser } from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import i18nConfig from '../next-i18next.config'
import { JourneyList } from '../src/components/JourneyList'
import { OnboardingPanel } from '../src/components/OnboardingPanel'
import { PageWrapper } from '../src/components/PageWrapper'
import { TeamMenu } from '../src/components/Team/TeamMenu'
import { TeamSelect } from '../src/components/Team/TeamSelect'

function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()

  return (
    <>
      <NextSeo title={t('Journeys')} />
      <PageWrapper
        user={user}
        mainHeaderChildren={
          <Stack
            direction="row"
            flexGrow={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <TeamSelect onboarding={router.query.onboarding === 'true'} />
            <TeamMenu />
          </Stack>
        }
        sidePanelChildren={<OnboardingPanel />}
        sidePanelTitle={t('Create a New Journey')}
      >
        <JourneyList user={user} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const translations = await serverSideTranslations(
    locale ?? 'en',
    ['apps-journeys-admin', 'libs-journeys-ui'],
    i18nConfig
  )

  return {
    props: {
      ...translations
    }
  }
}

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
