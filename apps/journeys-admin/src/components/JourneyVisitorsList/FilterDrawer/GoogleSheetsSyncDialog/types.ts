export interface GoogleSheetsSyncItem {
  id: string
  spreadsheetId: string | null
  sheetName: string | null
  email: string | null
  deletedAt: string | null
  createdAt: string
  integration: {
    __typename: string
    id: string
    accountEmail?: string | null
  } | null
}

export interface GoogleSheetsSyncsQueryData {
  googleSheetsSyncs: GoogleSheetsSyncItem[]
}

export interface GoogleSheetsSyncsQueryVariables {
  filter: {
    journeyId?: string
    integrationId?: string
  }
}

export interface SyncFormValues {
  integrationId: string
  googleMode: '' | 'create' | 'existing'
  spreadsheetTitle: string
  sheetName: string
  folderId?: string
  folderName?: string
  existingSpreadsheetId?: string
  existingSpreadsheetName?: string
}
