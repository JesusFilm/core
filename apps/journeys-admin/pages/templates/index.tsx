import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateGallery } from '../../src/components/TemplateGallery'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function LibraryIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper
        title={t('Journey Templates')}
        user={user}
        mainPanelSx={{
          backgroundColor: 'background.paper',
          overflowX: 'hidden'
        }}
        showMainHeader={false}
      >
        <TemplateGallery />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR()(
  async ({ user, locale, resolvedUrl }) => {
    const { redirect, translations } = await initAndAuthApp({
      user,
      locale,
      resolvedUrl
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
