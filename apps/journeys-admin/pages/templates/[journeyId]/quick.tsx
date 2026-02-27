import { gql } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { ReactElement, useEffect } from 'react'

import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'

import { GetTeams } from '../../../__generated__/GetTeams'
import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from '../../../__generated__/JourneyDuplicate'
import {
  JourneyNotificationUpdate,
  JourneyNotificationUpdateVariables
} from '../../../__generated__/JourneyNotificationUpdate'
import { getAuthTokens, redirectToLogin, toUser } from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { JOURNEY_NOTIFICATION_UPDATE } from '../../../src/libs/useJourneyNotificationUpdate/useJourneyNotificationUpdate'

export const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
    }
  }
`

function TemplateQuickPage(): ReactElement {
  const router = useRouter()

  useEffect(() => {
    void router.push(`/templates/${router.query.journeyId as string}`)
  }, [router])

  return <></>
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  const user = tokens != null ? toUser(tokens) : null

  if (user == null) return redirectToLogin(ctx)

  const { redirect, apolloClient } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  const { data: getTeams } = await apolloClient.query<GetTeams>({
    query: GET_TEAMS
  })

  if (getTeams.teams.length === 1 && ctx.query?.journeyId != null) {
    const { data: journeyDuplicate } = await apolloClient.mutate<
      JourneyDuplicate,
      JourneyDuplicateVariables
    >({
      mutation: JOURNEY_DUPLICATE,
      variables: {
        id: ctx.query.journeyId.toString(),
        teamId: getTeams.teams[0].id
      }
    })
    if (journeyDuplicate?.journeyDuplicate.id != null) {
      await apolloClient.mutate<
        JourneyNotificationUpdate,
        JourneyNotificationUpdateVariables
      >({
        mutation: JOURNEY_NOTIFICATION_UPDATE,
        variables: {
          input: {
            journeyId: journeyDuplicate.journeyDuplicate.id,
            visitorInteractionEmail: true
          }
        }
      })
      return {
        redirect: {
          destination: `/journeys/${journeyDuplicate.journeyDuplicate.id}/quick`,
          permanent: false
        }
      }
    }
  }

  return {
    redirect: {
      destination: `/templates/${(ctx.query?.journeyId ?? '') as string}`,
      permanent: false
    }
  }
}

export default TemplateQuickPage
