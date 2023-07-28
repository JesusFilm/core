import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useTranslation } from 'react-i18next'
import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import { Editor } from '../../../src/components/Editor'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { GET_JOURNEY, USER_JOURNEY_OPEN } from '../[journeyId]'
import { JourneyEdit } from '../../../src/components/Editor/JourneyEdit'
import { EditToolbar } from '../../../src/components/Editor/EditToolbar'
import { ACCEPT_ALL_INVITES } from '../..'
import { useInvalidJourneyRedirect } from '../../../src/libs/useInvalidJourneyRedirect/useInvalidJourneyRedirect'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { AcceptAllInvites } from '../../../__generated__/AcceptAllInvites'

interface JourneyEditPageProps {
  data: GetJourney
}

function JourneyEditPage({ data }: JourneyEditPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()

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
          showDrawer
          backHref={`/journeys/${router.query.journeyId as string}`}
          menu={<EditToolbar />}
          authUser={AuthUser}
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
  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    AuthUser,
    locale
  })

  if (redirect != null) return { redirect }

  await apolloClient.mutate<AcceptAllInvites>({
    mutation: ACCEPT_ALL_INVITES
  })

  let journey: Journey | null
  let result: GetJourney
  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: query?.journeyId
      }
    })

    journey = data?.journey
    result = data
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
      data: result,
      ...translations
    }
  }
})

export default withAuthUser<JourneyEditPageProps>({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyEditPage)
