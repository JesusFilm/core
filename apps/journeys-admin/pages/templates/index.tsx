import { useRouter } from 'next/router'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { PageWrapper } from '../../src/components/NewPageWrapper'
import { TemplateGallery } from '../../src/components/TemplateGallery'
import { TemplateLibrary } from '../../src/components/TemplateLibrary'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function LibraryIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const { templates } = useFlags()
  const router = useRouter()

  useEffect(() => {
    // call in it's own event handler
    void router.push({
      pathname: '/templates',
      query: {
        tags: [
          'cdefc2e8-eb22-46df-bc32-c2a99d8fe663',
          '20aab916-de2a-45a8-88b6-2be75fe378bc'
        ]
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <NextSeo title={t('Journey Templates')} />
      <PageWrapper title={t('Journey Templates')} authUser={AuthUser}>
        {templates ? <TemplateGallery /> : <TemplateLibrary />}
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()(
  async ({ AuthUser, locale }) => {
    const { flags, translations } = await initAndAuthApp({
      AuthUser,
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

export default withAuthUser()(LibraryIndex)
