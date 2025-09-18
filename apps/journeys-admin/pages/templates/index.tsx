import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useUser, withUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TemplateGallery } from '@core/journeys/ui/TemplateGallery'
import { GET_JOURNEYS } from '@core/journeys/ui/useJourneysQuery'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { GET_TAGS } from '@core/journeys/ui/useTagsQuery'

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
import { HelpScoutBeacon } from '../../src/components/HelpScoutBeacon'
import { PageWrapper } from '../../src/components/PageWrapper'
import { GET_ME } from '../../src/components/PageWrapper/NavigationDrawer/UserNavigation'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function TemplateIndexPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const router = useRouter()
  const { data } = useQuery<GetMe>(GET_ME)
  const { getLastActiveTeamIdAndTeams } = useTeam()
  if (data?.me?.id != null && !data?.me?.emailVerified) {
    void router.push('/users/verify?redirect=/templates')
  }

  // useEffect(() => {
  //   console.log('templates index page useEffect')
  //   void getLastActiveTeamIdAndTeams()
  // }, [user.id, getLastActiveTeamIdAndTeams])

  const userSignedIn = user?.id != null

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper
        title={t('Journey Templates')}
        user={user}
        mainBodyPadding={false}
        showMainHeader={false}
        showAppHeader={userSignedIn}
        showNavBar={userSignedIn}
        fadeInNavBar
        background="background.paper"
      >
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            top: 8,
            display: { xs: userSignedIn ? 'none' : 'block', md: 'block' }
          }}
        >
          <HelpScoutBeacon
            userInfo={{
              name: user?.displayName ?? '',
              email: user?.email ?? ''
            }}
          />
        </Box>
        <Box
          sx={{
            maxWidth: { md: '90vw' },
            px: { xs: 6, sm: 8, md: 10 }
          }}
        >
          <TemplateGallery />
        </Box>
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
            '13169', // Thai
            '6464', // Hindi
            '12876', // Ukrainian
            '53441', // Arabic, Egyptian Modern Standard
            '1942', // Türkçe, Turkish
            '5541', // Serbian
            '6788', // Farsi, Western
            '3804', // Korean
            '1370' // Nepali
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
