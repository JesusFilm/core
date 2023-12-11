import { GetStaticProps } from 'next'
import { useUser, withUser } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import {
  GetJourneys,
  GetJourneysVariables
} from '../../__generated__/GetJourneys'
import {
  GetLanguages,
  GetLanguagesVariables
} from '../../__generated__/GetLanguages'
import { GetTags } from '../../__generated__/GetTags'
import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateGallery } from '../../src/components/TemplateGallery'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_JOURNEYS } from '../../src/libs/useJourneysQuery/useJourneysQuery'
import { GET_LANGUAGES } from '../../src/libs/useLanguagesQuery'
import { GET_TAGS } from '../../src/libs/useTagsQuery/useTagsQuery'

function TemplateIndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper
        title={t('Journey Templates')}
        user={user}
        mainBodyPadding={false}
        showMainHeader={false}
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
            '3934' // Русский, Russian
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
    }
  }
}

export default withUser()(TemplateIndexPage)
