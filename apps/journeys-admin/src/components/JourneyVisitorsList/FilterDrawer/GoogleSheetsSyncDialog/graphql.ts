import { gql } from '@apollo/client'

export const GET_JOURNEY_CREATED_AT = gql`
  query GoogleSheetsSyncDialogJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      createdAt
      title
      team {
        id
      }
    }
  }
`

export const GET_GOOGLE_PICKER_TOKEN = gql`
  query IntegrationGooglePickerToken($integrationId: ID!) {
    integrationGooglePickerToken(integrationId: $integrationId)
  }
`

export const GET_GOOGLE_SHEETS_SYNCS = gql`
  query GoogleSheetsSyncs($filter: GoogleSheetsSyncsFilter!) {
    googleSheetsSyncs(filter: $filter) {
      id
      spreadsheetId
      sheetName
      email
      deletedAt
      createdAt
      integration {
        __typename
        id
        ... on IntegrationGoogle {
          accountEmail
        }
      }
    }
  }
`

export const EXPORT_TO_SHEETS = gql`
  mutation JourneyVisitorExportToGoogleSheet(
    $journeyId: ID!
    $destination: JourneyVisitorGoogleSheetDestinationInput!
    $integrationId: ID!
    $timezone: String
  ) {
    journeyVisitorExportToGoogleSheet(
      journeyId: $journeyId
      destination: $destination
      integrationId: $integrationId
      timezone: $timezone
    ) {
      spreadsheetId
      spreadsheetUrl
      sheetName
    }
  }
`

export const DELETE_GOOGLE_SHEETS_SYNC = gql`
  mutation GoogleSheetsSyncDialogDelete($id: ID!) {
    googleSheetsSyncDelete(id: $id) {
      id
    }
  }
`

export const BACKFILL_GOOGLE_SHEETS_SYNC = gql`
  mutation GoogleSheetsSyncDialogBackfill($id: ID!) {
    googleSheetsSyncBackfill(id: $id) {
      id
    }
  }
`

export const INTEGRATION_GOOGLE_CREATE = gql`
  mutation IntegrationGoogleCreate($input: IntegrationGoogleCreateInput!) {
    integrationGoogleCreate(input: $input) {
      id
    }
  }
`
