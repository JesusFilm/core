import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { JourneyView } from '../../src/components/JourneyView'
import { Menu } from '../../src/components/JourneyView/Menu'
import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateView } from '../../src/components/TemplateView/TemplateView'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect'
import { useJourneyQuery } from '../../src/libs/useJourneyQuery/useJourneyQuery'

function TemplateDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { templates } = useFlags()
  const AuthUser = useAuthUser()
  const { data } = useJourneyQuery({
    id: router.query.journeyId as string
  })
  const template = data?.journey
  useInvalidJourneyRedirect(data)

  return (
    <>
      <NextSeo
        title={template?.title ?? t('Template Details')}
        description={template?.description ?? undefined}
      />
      <JourneyProvider
        value={{
          journey: template,
          variant: 'admin'
        }}
      >
        <PageWrapper
          title={template?.title ?? t('Template Details')}
          authUser={AuthUser}
          backHref="/templates"
          mainHeaderChildren={
            <Stack
              direction="row"
              flexGrow={1}
              justifyContent="flex-end"
              alignItems="center"
            >
              <Menu />
            </Stack>
          }
        >
          {templates ? (
            <TemplateView />
          ) : (
            <JourneyView journeyType="Template" />
          )}
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()(
  async ({ AuthUser, locale }) => {
    const { flags, translations } = await initAndAuthApp({
      AuthUser,
      locale
    })

    return {
      props: {
        flags,
        ...translations
      }
    }
  }
)

export default withAuthUser()(TemplateDetails)
