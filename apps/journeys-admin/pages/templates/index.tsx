import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateGallery } from '../../src/components/TemplateGallery'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { GET_JOURNEYS } from '../../src/libs/useJourneysQuery/useJourneysQuery'

function LibraryIndex(): ReactElement {
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

export const getServerSideProps = withUserTokenSSR()(
  async ({ user, locale, resolvedUrl }) => {
    const { apolloClient, redirect, translations } = await initAndAuthApp({
      user,
      locale,
      resolvedUrl
    })

    await apolloClient.query({
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

    if (redirect != null) return { redirect }

    return {
      props: {
        ...translations
      }
    }
  }
)

export default withUser()(LibraryIndex)
