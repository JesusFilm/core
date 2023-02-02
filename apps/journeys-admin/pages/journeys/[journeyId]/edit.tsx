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
import { GetJourney } from '../../../__generated__/GetJourney'
import { Editor } from '../../../src/components/Editor'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { GET_JOURNEY } from '../[journeyId]'
import { JourneyEdit } from '../../../src/components/Editor/JourneyEdit'
import { EditToolbar } from '../../../src/components/Editor/EditToolbar'
import { JourneyInvite } from '../../../src/components/JourneyInvite/JourneyInvite'
import { createApolloClient } from '../../../src/libs/apolloClient'
import i18nConfig from '../../../next-i18next.config'
import { useUserJourneyOpen } from '../../../src/libs/useUserJourneyOpen'
import { useJourney } from '../../../../../libs/journeys/ui/src/libs/JourneyProvider'

function JourneyEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { journey } = useJourney()
  const { data, error } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeyId }
  })

  useUserJourneyOpen(AuthUser.id, journey?.id, journey?.userJourneys)

  return (
    <>
      {error == null && (
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
          >
            <PageWrapper
              title={data?.journey?.title ?? t('Edit Journey')}
              showDrawer
              backHref={`/journeys/${router.query.journeyId as string}`}
              menu={<EditToolbar />}
              authUser={AuthUser}
              router={router}
            >
              <JourneyEdit />
            </PageWrapper>
          </Editor>
        </>
      )}
      {error?.graphQLErrors[0].message ===
        'User has not received an invitation to edit this journey.' && (
        <>
          <NextSeo title={t('Access Denied')} />
          <JourneyInvite journeyId={router.query.journeyId as string} />
        </>
      )}
      {error?.graphQLErrors[0].message === 'User invitation pending.' && (
        <>
          <NextSeo title={t('Access Denied')} />
          <JourneyInvite
            journeyId={router.query.journeyId as string}
            requestReceived
          />
        </>
      )}
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

  const { data } = await apolloClient.query<GetJourney>({
    query: GET_JOURNEY,
    variables: {
      id: query?.journeyId
    }
  })

  if (data?.journey?.template === true) {
    return {
      redirect: {
        permanent: false,
        destination: `/publisher/${data?.journey?.id}/edit`
      }
    }
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
})(JourneyEditPage)
