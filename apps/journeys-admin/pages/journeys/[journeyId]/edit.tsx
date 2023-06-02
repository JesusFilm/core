import { ReactElement } from 'react'
import { useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { UserInviteAcceptAll } from '../../../__generated__/UserInviteAcceptAll'
import { Editor } from '../../../src/components/Editor'
import { PageWrapper } from '../../../src/components/NewPageWrapper'
import { GET_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'
import { JourneyEdit } from '../../../src/components/Editor/JourneyEdit'
import { EditToolbar } from '../../../src/components/Editor/EditToolbar'
import { createApolloClient } from '../../../src/libs/apolloClient'
import i18nConfig from '../../../next-i18next.config'
import { ACCEPT_USER_INVITE } from '../..'
import { useTermsRedirect } from '../../../src/libs/useTermsRedirect/useTermsRedirect'
import { useInvalidJourneyRedirect } from '../../../src/libs/useInvalidJourneyRedirect/useInvalidJourneyRedirect'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { Drawer } from '../../../src/components/Editor/Drawer'
import { DrawerTitle } from '../../../src/components/Editor/Drawer/DrawerTitle'

function JourneyEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeyId }
  })
  useTermsRedirect()
  useInvalidJourneyRedirect(data)
  const isEdit = true

  return (
    <>
      <NextSeo
        title={
          data?.journey?.title != null
            ? t('Edit {{title}}', { title: data.journey.title })
            : t('Edit Journey')
        }
        description={data?.journey?.description ?? undefined}
      />
      <Editor
        journey={data?.journey ?? undefined}
        selectedStepId={router.query.stepId as string | undefined}
        view={router.query.view as ActiveJourneyEditContent | undefined}
      >
        <PageWrapper
          title={data?.journey?.title ?? t('Edit Journey')}
          backHref={`/journeys/${router.query.journeyId as string}`}
          menu={<EditToolbar />}
          authUser={AuthUser}
          sidePanelTitle={<DrawerTitle />}
          sidePanelChildren={<Drawer />}
          isEdit={isEdit}
        >
          <JourneyEdit />
        </PageWrapper>
      </Editor>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, locale, query }) => {
  const ldUser = {
    key: AuthUser.id as string,
    firstName: AuthUser.displayName ?? undefined,
    email: AuthUser.email ?? undefined
  }
  const launchDarklyClient = await getLaunchDarklyClient(ldUser)
  const flags = (await launchDarklyClient.allFlagsState(ldUser)).toJSON() as {
    [key: string]: boolean | undefined
  }

  const token = await AuthUser.getIdToken()
  const apolloClient = createApolloClient(token != null ? token : '')

  await apolloClient.mutate<UserInviteAcceptAll>({
    mutation: ACCEPT_USER_INVITE
  })

  let journey: Journey | null
  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: query?.journeyId
      }
    })

    journey = data?.journey
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: `/journeys/${query?.journeyId as string}`
      }
    }
  }

  if (journey?.template === true) {
    return {
      redirect: {
        permanent: false,
        destination: `/publisher/${journey?.id}/edit`
      }
    }
  }

  await apolloClient.mutate<UserJourneyOpen>({
    mutation: USER_JOURNEY_OPEN,
    variables: { id: query?.journeyId }
  })

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
})(JourneyEditPage)
