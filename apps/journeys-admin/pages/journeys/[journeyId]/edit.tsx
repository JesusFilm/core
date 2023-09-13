import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'

import { ACCEPT_ALL_INVITES } from '../..'
import { AcceptAllInvites } from '../../../__generated__/AcceptAllInvites'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { Editor } from '../../../src/components/Editor'
import { ControlPanel } from '../../../src/components/Editor/ControlPanel'
import { Drawer } from '../../../src/components/Editor/Drawer'
import { EditToolbar } from '../../../src/components/Editor/EditToolbar'
import { JourneyEdit } from '../../../src/components/Editor/JourneyEdit'
import { PageWrapper } from '../../../src/components/NewPageWrapper'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { useInvalidJourneyRedirect } from '../../../src/libs/useInvalidJourneyRedirect/useInvalidJourneyRedirect'
import { GET_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'

function JourneyEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeyId }
  })
  useInvalidJourneyRedirect(data)

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
          authUser={AuthUser}
          mainHeaderChildren={<EditToolbar />}
          backHref={`/journeys/${router.query.journeyId as string}`}
          mainBodyPadding={false}
          bottomPanelChildren={<ControlPanel />}
          customSidePanel={<Drawer />}
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
  if (AuthUser == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  if (redirect != null) return { redirect }

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
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
      ...translations
    }
  }
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyEditPage)
