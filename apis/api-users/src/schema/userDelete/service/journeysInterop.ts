import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'

import { LogEntry, createLog } from './types'

const gatewayUrl = process.env.GATEWAY_URL ?? 'http://localhost:4000'

const httpLink = createHttpLink({
  uri: gatewayUrl,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-users',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: { fetchPolicy: 'no-cache' },
    query: { fetchPolicy: 'no-cache' }
  }
})

const USER_DELETE_JOURNEYS_CHECK = gql`
  mutation UserDeleteJourneysCheck($userId: String!) {
    userDeleteJourneysCheck(userId: $userId) {
      journeysToDelete
      journeysToTransfer
      journeysToRemove
      teamsToDelete
      teamsToTransfer
      teamsToRemove
      logs {
        message
        level
        timestamp
      }
    }
  }
`

const USER_DELETE_JOURNEYS_CONFIRM = gql`
  mutation UserDeleteJourneysConfirm($userId: String!) {
    userDeleteJourneysConfirm(userId: $userId) {
      success
      deletedJourneyIds
      deletedTeamIds
      deletedUserJourneyIds
      deletedUserTeamIds
      logs {
        message
        level
        timestamp
      }
    }
  }
`

interface JourneysCheckResult {
  journeysToDelete: number
  journeysToTransfer: number
  journeysToRemove: number
  teamsToDelete: number
  teamsToTransfer: number
  teamsToRemove: number
  logs: LogEntry[]
}

interface JourneysConfirmResult {
  success: boolean
  deletedJourneyIds: string[]
  deletedTeamIds: string[]
  deletedUserJourneyIds: string[]
  deletedUserTeamIds: string[]
  logs: LogEntry[]
}

export async function callJourneysCheck(
  userId: string
): Promise<JourneysCheckResult> {
  try {
    const { data } = await apollo.mutate<{
      userDeleteJourneysCheck: JourneysCheckResult
    }>({
      mutation: USER_DELETE_JOURNEYS_CHECK,
      variables: { userId }
    })

    if (data?.userDeleteJourneysCheck == null) {
      return {
        journeysToDelete: 0,
        journeysToTransfer: 0,
        journeysToRemove: 0,
        teamsToDelete: 0,
        teamsToTransfer: 0,
        teamsToRemove: 0,
        logs: [createLog('❌ Failed to get journeys check result', 'error')]
      }
    }

    return data.userDeleteJourneysCheck
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      journeysToDelete: 0,
      journeysToTransfer: 0,
      journeysToRemove: 0,
      teamsToDelete: 0,
      teamsToTransfer: 0,
      teamsToRemove: 0,
      logs: [
        createLog(
          `❌ Journeys check failed: ${message} (GATEWAY_URL ${process.env.GATEWAY_URL != null ? 'is set' : 'is NOT set'})`,
          'error'
        )
      ]
    }
  }
}

export async function callJourneysConfirm(
  userId: string
): Promise<JourneysConfirmResult> {
  try {
    const { data } = await apollo.mutate<{
      userDeleteJourneysConfirm: JourneysConfirmResult
    }>({
      mutation: USER_DELETE_JOURNEYS_CONFIRM,
      variables: { userId }
    })

    if (data?.userDeleteJourneysConfirm == null) {
      return {
        success: false,
        deletedJourneyIds: [],
        deletedTeamIds: [],
        deletedUserJourneyIds: [],
        deletedUserTeamIds: [],
        logs: [createLog('❌ Failed to get journeys confirm result', 'error')]
      }
    }

    return data.userDeleteJourneysConfirm
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      deletedJourneyIds: [],
      deletedTeamIds: [],
      deletedUserJourneyIds: [],
      deletedUserTeamIds: [],
      logs: [createLog(`❌ Journeys confirm failed: ${message}`, 'error')]
    }
  }
}
