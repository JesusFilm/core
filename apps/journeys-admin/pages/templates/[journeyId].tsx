import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney, GetJourneyVariables } from '../../__generated__/GetJourney'
import {
  GetJourneys,
  GetJourneysVariables
} from '../../__generated__/GetJourneys'
import { GetTags } from '../../__generated__/GetTags'
import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateView } from '../../src/components/TemplateView'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import {
  GET_JOURNEY,
  useJourneyQuery
} from '../../src/libs/useJourneyQuery/useJourneyQuery'
import { GET_JOURNEYS } from '../../src/libs/useJourneysQuery/useJourneysQuery'
import { GET_TAGS } from '../../src/libs/useTagsQuery/useTagsQuery'

function TemplateDetailsPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
  const { data } = useJourneyQuery({
    id: router.query.journeyId as string
  })

  return (
    <>
      <NextSeo
        title={data?.journey?.title ?? t('Journey Template')}
        description={data?.journey?.description ?? undefined}
      />
      <JourneyProvider
        value={{
          journey: data?.journey,
          variant: 'admin'
        }}
      >
        <PageWrapper
          title={t('Journey Template')}
          user={user}
          backHref="/templates"
          backHrefHistory
          mainBodyPadding={false}
        >
          <TemplateView authUser={user} />
        </PageWrapper>
      </JourneyProvider>
    </>
  )
}

export const getServerSideProps: GetStaticProps = withUserTokenSSR()(
  async ({ user, locale, resolvedUrl, params }) => {
    const { redirect, apolloClient, translations } = await initAndAuthApp({
      user,
      locale,
      resolvedUrl
    })

    if (params?.journeyId == null) {
      return {
        redirect: {
          destination: '/templates',
          permanent: false
        }
      }
    }

    if (redirect != null) return { redirect }

    try {
      // TemplateDetailsPage
      const { data } = await apolloClient.query<
        GetJourney,
        GetJourneyVariables
      >({
        query: GET_JOURNEY,
        variables: {
          id: params.journeyId.toString()
        }
      })
      const tagIds = data.journey.tags.map((tag) => tag.id)
      // src/components/TemplateView/TemplateView.tsx useJourneysQuery
      await apolloClient.query<GetJourneys, GetJourneysVariables>({
        query: GET_JOURNEYS,
        variables: {
          where: {
            template: true,
            orderByRecent: true,
            tagIds
          }
        }
      })
      // src/components/TemplateView/TemplateTags/TemplateTags.tsx useTagsQuery
      await apolloClient.query<GetTags>({
        query: GET_TAGS
      })
    } catch (error) {
      if (error.message === 'journey not found') {
        return {
          redirect: {
            destination: '/templates',
            permanent: false
          }
        }
      }
      throw error
    }

    return {
      props: {
        ...translations,
        initialApolloState: apolloClient.cache.extract()
      }
    }
  }
)

export default withUser()(TemplateDetailsPage)
