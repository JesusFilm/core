import { gql } from '@apollo/client'

export const USER_DELETE_CHECK = gql`
  mutation UserDeleteCheck($idType: UserDeleteIdType!, $id: String!) {
    userDeleteCheck(idType: $idType, id: $id) {
      userId
      userEmail
      userFirstName
      logs {
        message
        level
        timestamp
      }
    }
  }
`

export const USER_DELETE_JOURNEYS_CHECK = gql`
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

export const USER_DELETE_JOURNEYS_CONFIRM = gql`
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

export const USER_DELETE_CONFIRM = gql`
  subscription UserDeleteConfirmSubscription(
    $idType: UserDeleteIdType!
    $id: String!
    $deletedJourneyIds: [String!]!
    $deletedTeamIds: [String!]!
    $deletedUserJourneyIds: [String!]!
    $deletedUserTeamIds: [String!]!
  ) {
    userDeleteConfirm(
      idType: $idType
      id: $id
      deletedJourneyIds: $deletedJourneyIds
      deletedTeamIds: $deletedTeamIds
      deletedUserJourneyIds: $deletedUserJourneyIds
      deletedUserTeamIds: $deletedUserTeamIds
    ) {
      log {
        message
        level
        timestamp
      }
      done
      success
    }
  }
`
