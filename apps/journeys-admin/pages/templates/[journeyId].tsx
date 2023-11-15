import { useRouter } from 'next/router'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateView } from '../../src/components/TemplateView'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useInvalidJourneyRedirect } from '../../src/libs/useInvalidJourneyRedirect'
import { useJourneyQuery } from '../../src/libs/useJourneyQuery/useJourneyQuery'

function TemplateDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
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
          user={user}
          backHref="/templates"
          mainPanelSx={{
            backgroundColor: 'background.paper',
            overflowX: 'hidden'
          }}
          backHrefHistory
        >
          <TemplateView authUser={user} />
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR()(
  async ({ user, locale, resolvedUrl }) => {
    const { flags, redirect, translations } = await initAndAuthApp({
      user,
      locale,
      resolvedUrl
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

export default withUser()(TemplateDetails)
