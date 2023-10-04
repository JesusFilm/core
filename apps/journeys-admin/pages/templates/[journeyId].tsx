import { useRouter } from 'next/router'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
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
          showDrawer
          backHref="/templates"
          menu={<Menu />}
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

export const getServerSideProps = withUserTokenSSR()(
  async ({ user, locale }) => {
    if (user == null)
      return { redirect: { permanent: false, destination: '/users/sign-in' } }

    const { flags, translations } = await initAndAuthApp({
      user,
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

export default withUser()(TemplateDetails)
