import { NextSeo } from 'next-seo'
import { ReactElement, useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { useRouter } from 'next/router'
import { Role } from '../../__generated__/globalTypes'
import { GetUserRole } from '../../__generated__/GetUserRole'
import { PageWrapper } from '../../src/components/PageWrapper'
import { TemplateList } from '../../src/components/TemplateList'
import i18nConfig from '../../next-i18next.config'
import JourneyListMenu from '../../src/components/JourneyList/JourneyListMenu/JourneyListMenu'
import { GET_USER_ROLE } from '../../src/components/JourneyView/JourneyView'
import { useTermsRedirect } from '../../src/libs/useTermsRedirect/useTermsRedirect'

function TemplateIndex(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const AuthUser = useAuthUser()
  const router = useRouter()
  const [listEvent, setListEvent] = useState('')

  const handleClick = (event: string): void => {
    setListEvent(event)
    // remove event after component lifecycle
    setTimeout(() => {
      setListEvent('')
    }, 1000)
  }

  const { data } = useQuery<GetUserRole>(GET_USER_ROLE)
  useEffect(() => {
    if (
      data != null &&
      data?.getUserRole?.roles?.includes(Role.publisher) !== true
    ) {
      void router.push('/templates')
    }
  }, [data, router])

  const termsAccepted = useTermsRedirect()

  return (
    <>
      {termsAccepted && (
        <>
          <NextSeo title={t('Templates Admin')} />
          <PageWrapper
            title={t('Templates Admin')}
            authUser={AuthUser}
            menu={<JourneyListMenu router={router} onClick={handleClick} />}
            router={router}
          >
            <TemplateList
              router={router}
              event={listEvent}
              authUser={AuthUser}
            />
          </PageWrapper>
        </>
      )}
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
