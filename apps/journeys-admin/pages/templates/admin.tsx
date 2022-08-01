import { NextSeo } from 'next-seo'
import { ReactElement, useState } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { useRouter } from 'next/router'
import { TemplatesAdmin } from '../../src/components/TemplatesAdmin'
import { PageWrapper } from '../../src/components/PageWrapper'
import i18nConfig from '../../next-i18next.config'
import JourneyListMenu from '../../src/components/JourneyList/JourneyListMenu/JourneyListMenu'

function TemplateAdmin(): ReactElement {
  const router = useRouter()
  const AuthUser = useAuthUser()
  const [listEvent, setListEvent] = useState('')

  const handleClick = (event: string): void => {
    setListEvent(event)
    // remove event after component lifecycle
    setTimeout(() => {
      setListEvent('')
    }, 1000)
  }
  return (
    <>
      <NextSeo title={'Templates Admin'} />
      <PageWrapper
        title={'Templates Admin'}
        authUser={AuthUser}
        menu={<JourneyListMenu router={router} onClick={handleClick} />}
      >
        <TemplatesAdmin router={router} event={listEvent} />
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
})(TemplateAdmin)
