import { gql, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useUser,
  withUser,
  withUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

import {
  GetAdminJourney,
  GetAdminJourneyVariables
} from '../../__generated__/GetAdminJourney'
import { UserJourneyOpen } from '../../__generated__/UserJourneyOpen'
import { Editor } from '../../src/components/Editor'
import { ControlPanel } from '../../src/components/Editor/ControlPanel'
import { Drawer } from '../../src/components/Editor/Drawer'
import { EditToolbar } from '../../src/components/Editor/EditToolbar'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

export const GET_ADMIN_JOURNEY = gql`
  ${JOURNEY_FIELDS}
  query GetAdminJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

export const USER_JOURNEY_OPEN = gql`
  mutation UserJourneyOpen($id: ID!) {
    userJourneyOpen(id: $id) {
      id
    }
  }
`

function JourneyEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const user = useUser()
  const { data } = useQuery<GetAdminJourney, GetAdminJourneyVariables>(
    GET_ADMIN_JOURNEY,
    {
      variables: { id: router.query.journeyId as string }
    }
  )

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
        PageWrapperProps={{
          title: data?.journey?.title ?? t('Edit Journey'),
          backHref: '/',
          mainHeaderChildren: <EditToolbar />,
          mainBodyPadding: false,
          bottomPanelChildren: <ControlPanel />,
          customSidePanel: <Drawer />,
          user
        }}
      />
    </>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  try {
    const { data } = await apolloClient.query<GetAdminJourney>({
      query: GET_ADMIN_JOURNEY,
      variables: {
        id: query?.journeyId
      }
    })

    if (data.journey?.template === true) {
      return {
        redirect: {
          permanent: false,
          destination: `/publisher/${data.journey?.id}`
        }
      }
    }
    await apolloClient.mutate<UserJourneyOpen>({
      mutation: USER_JOURNEY_OPEN,
      variables: { id: data.journey?.id }
    })
  } catch (error) {
    if (error.message === 'journey not found') {
      return {
        redirect: {
          permanent: false,
          destination: `/journeys`
        }
      }
    }
    throw error
  }

  return {
    props: {
      ...translations,
      flags,
      initialApolloState: apolloClient.cache.extract()
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyEditPage)
