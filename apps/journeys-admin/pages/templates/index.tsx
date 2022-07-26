import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { PageWrapper } from '../../src/components/PageWrapper'
import i18nConfig from '../../next-i18next.config'
import { TemplateList } from '../../src/components/TemplateList'

// this should get replaced with the actual template journey query data
const templatesData = [
  {
    id: '1',
    title: 'Default Journey',
    date: '25 September',
    description: 'A short preview of the description',
    socialShareImage:
      'https://images.unsplash.com/photo-1657299142317-00e647447f80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxlZGl0b3JpYWwtZmVlZHw2fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: '2',
    title: 'Another Journey',
    date: '25 November',
    description: 'A short preview of the description',
    socialShareImage:
      'https://images.unsplash.com/photo-1658474908312-eb601aaf1ea0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxM3x8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: '3',
    title: 'Test Journey',
    date: '25 December',
    description: 'A short preview of the description',
    socialShareImage:
      'https://images.unsplash.com/photo-1658728942300-1e1bf292b7d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxMnx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60'
  }
]

function TemplateIndex(): ReactElement {
  const AuthUser = useAuthUser()

  return (
    <>
      <NextSeo title={'Journey Templates'} />
      <PageWrapper title={'Journey Templates'} authUser={AuthUser}>
        <TemplateList templates={templatesData} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale }) => {
  const ldUser = {
    key: AuthUser.id as string,
    firstName: AuthUser.displayName ?? undefined,
    email: AuthUser.email ?? undefined
  }
  const launchDarklyClient = await getLaunchDarklyClient(ldUser)
  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }
  return {
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateIndex)
