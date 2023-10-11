import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateGallery } from '../../src/components/TemplateGallery'
import { TemplateLibrary } from '../../src/components/TemplateLibrary'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function LibraryIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const user = useUser()
  const { templates } = useFlags()

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper
        title={t('Journey Templates')}
        user={user}
        bodyBackgroundColor={templates ? 'background.paper' : undefined}
      >
        {templates ? <TemplateGallery /> : <TemplateLibrary />}
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withUserTokenSSR()(
  async ({ user, locale, resolvedUrl }) => {
    const { flags, translations } = await initAndAuthApp({
      user,
      locale,
      resolvedUrl
    })

    return {
      props: {
        flags,
        ...translations
      }
    }
  }
)

export default withUser()(LibraryIndex)
