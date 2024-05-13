import { useQuery } from '@apollo/client'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useUser, withUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import {
  GetJourneys,
  GetJourneysVariables
} from '../../__generated__/GetJourneys'
import {
  GetLanguages,
  GetLanguagesVariables
} from '../../__generated__/GetLanguages'
import { GetMe } from '../../__generated__/GetMe'
import { GetTags } from '../../__generated__/GetTags'
import { PageWrapper } from '../../src/components/PageWrapper'
import { GET_ME } from 'apps/journeys-admin/src/components/PageWrapper/UserNavigation'
import { TemplateGallery } from '../../src/components/TemplateGallery'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_JOURNEYS } from '../../src/libs/useJourneysQuery/useJourneysQuery'
import { GET_LANGUAGES } from '../../src/libs/useLanguagesQuery'
import { GET_TAGS } from '../../src/libs/useTagsQuery/useTagsQuery'

function TemplateIndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()
  const { data } = useQuery<GetMe>(GET_ME)

  if (data?.me?.id != null && !data?.me?.emailVerified) {
    void router.push('/users/verify?redirect=/templates')
  }

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper
        title={t('Journey Templates')}
        user={user}
        mainBodyPadding={false}
        showMainHeader={false}
        showAppHeader={user?.id != null}
        showNavBar={user?.id != null}
      >
        <TemplateGallery />
      </PageWrapper>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const { apolloClient, translations } = await initAndAuthApp({
    locale
  })

  await Promise.all([
    apolloClient.query<GetLanguages, GetLanguagesVariables>({
      // from /workspaces/core/apps/journeys-admin/src/components/TemplateGallery/HeaderAndLanguageFilter/HeaderAndLanguageFilter.tsx useLanguagesQuery
      query: GET_LANGUAGES,
      variables: {
        languageId: '529',
        where: {
          // make sure theese variables are the same as in HeaderAndLanguageFilter.tsx
          ids: [
            '529', // English
            '4415', // Italiano, Italian
            '1106', // Deutsch, German, Standard
            '4451', // polski, Polish
            '496', // Français, French
            '20526', // Shqip, Albanian
            '584', // Português, Portuguese, Brazil
            '21028', // Español, Spanish, Latin American
            '20615', // 普通話, Chinese, Mandarin
            '3934', // Русский, Russian
            '22658', // Arabic Modern
            '7083', // Japanese
            '16639', // Bahasa Indonesia
            '3887', // Vietnamese
            '13169' // Thai
          ]
        }
      }
    }),
    apolloClient.query<GetTags>({
      // from apps/journeys-admin/src/components/TemplateGallery/TagsFilter/TagsFilter.tsx useJourneysQuery
      query: GET_TAGS
    }),
    apolloClient.query<GetJourneys, GetJourneysVariables>({
      // from apps/journeys-admin/src/components/TemplateSections/TemplateSections.tsx useJourneysQuery
      query: GET_JOURNEYS,
      variables: {
        where: {
          template: true,
          orderByRecent: true,
          tagIds: undefined,
          languageIds: ['529']
        }
      }
    })
  ])

  return {
    props: {
      ...translations,
      initialApolloState: apolloClient.cache.extract()
    },
    revalidate: 60
  }
}

export default withUser()(TemplateIndexPage)
