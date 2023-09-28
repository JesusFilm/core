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
import { PageWrapper } from '../../src/components/PageWrapper'
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
        title={template?.title ?? t('Journey Template')}
        description={template?.description ?? undefined}
      />
      <JourneyProvider
        value={{
          journey: template,
          variant: 'admin'
        }}
      >
        <PageWrapper
          title={t('Journey Template')}
          authUser={AuthUser}
          showDrawer
          backHref="/templates"
          menu={<Menu />}
        >
          {templates ? (
            <TemplateView authUser={AuthUser} />
          ) : (
            <JourneyView journeyType="Template" />
          )}
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()(
  async ({ AuthUser, locale, req }) => {
    // Without this we could get a stack of redirect queries (eg redirect to then terms and conditions, then templates)
    const refererUrl = req.headers.referer

    const { flags, redirect, translations } = await initAndAuthApp({
      AuthUser,
      locale,
      refererUrl
    })

    if (redirect != null) return { redirect }

    return {
      props: {
        flags,
        ...translations
      }
    }
  }
)

export default withAuthUser()(TemplateDetails)
