import { gql } from '@apollo/client'

import { createApolloClient } from '@core/yoga/apolloClient'

import { LogEntry, createLog } from './types'

const apolloClient = createApolloClient('api-users')
const INTEROP_TIMEOUT_MS = 120_000

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

export async function callJourneysCheck(
  userId: string
): Promise<JourneysCheckResult> {
  try {
    const { data } = await apolloClient.mutate<{
      userDeleteJourneysCheck: JourneysCheckResult
    }>({
      mutation: USER_DELETE_JOURNEYS_CHECK,
      variables: { userId },
      fetchPolicy: 'no-cache',
      context: {
        fetchOptions: { signal: AbortSignal.timeout(INTEROP_TIMEOUT_MS) }
      }
    })

    if (data?.userDeleteJourneysCheck == null) {
      return {
        journeysToDelete: 0,
        journeysToTransfer: 0,
        journeysToRemove: 0,
        teamsToDelete: 0,
        teamsToTransfer: 0,
        teamsToRemove: 0,
        logs: [createLog('❌ No data returned from journeys check', 'error')]
      }
    }

    return data.userDeleteJourneysCheck
  } catch (error) {
    // Rethrow so callers can distinguish a network/API failure from a
    // legitimate "nothing to clean up" result (returning all-zero counts
    // made interop failures indistinguishable from a clean empty result).
    console.error('Journeys check failed:', error)
    throw error
  }
}

export async function callJourneysConfirm(
  userId: string
): Promise<JourneysConfirmResult> {
  try {
    const { data } = await apolloClient.mutate<{
      userDeleteJourneysConfirm: JourneysConfirmResult
    }>({
      mutation: USER_DELETE_JOURNEYS_CONFIRM,
      variables: { userId },
      fetchPolicy: 'no-cache',
      context: {
        fetchOptions: { signal: AbortSignal.timeout(INTEROP_TIMEOUT_MS) }
      }
    })

    if (data?.userDeleteJourneysConfirm == null) {
      return {
        success: false,
        deletedJourneyIds: [],
        deletedTeamIds: [],
        deletedUserJourneyIds: [],
        deletedUserTeamIds: [],
        logs: [createLog('❌ No data returned from journeys confirm', 'error')]
      }
    }

    return data.userDeleteJourneysConfirm
  } catch (error) {
    // Rethrow so callers can distinguish a network/API failure from a
    // legitimate empty result — swallowing here made interop failures
    // indistinguishable from a successful no-op deletion.
    console.error('Journeys deletion failed:', error)
    throw error
  }
}
