import axios from 'axios'

export interface CreateSpreadsheetParams {
  accessToken: string
  title: string
  folderId?: string
  initialSheetTitle?: string
}

export interface CreateSpreadsheetResult {
  spreadsheetId: string
  spreadsheetUrl: string
}

export async function createSpreadsheet({
  accessToken,
  title,
  folderId,
  initialSheetTitle
}: CreateSpreadsheetParams): Promise<CreateSpreadsheetResult> {
  // If folder is specified, use Drive API to create the file in the folder
  if (folderId != null) {
    const driveRes = await axios.post(
      'https://www.googleapis.com/drive/v3/files',
      {
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId]
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { fields: 'id, webViewLink' }
      }
    )
    const spreadsheetId: string = driveRes.data.id
    const spreadsheetUrl: string = driveRes.data.webViewLink

    if (initialSheetTitle != null) {
      await ensureSheet({
        accessToken,
        spreadsheetId,
        sheetTitle: initialSheetTitle
      })
    }

    return { spreadsheetId, spreadsheetUrl }
  }

  // Otherwise use Sheets API to create
  const sheetsRes = await axios.post(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      properties: { title },
      sheets:
        initialSheetTitle != null
          ? [{ properties: { title: initialSheetTitle } }]
          : undefined
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  return {
    spreadsheetId: sheetsRes.data.spreadsheetId,
    spreadsheetUrl: sheetsRes.data.spreadsheetUrl
  }
}

export async function ensureSheet({
  accessToken,
  spreadsheetId,
  sheetTitle
}: {
  accessToken: string
  spreadsheetId: string
  sheetTitle: string
}): Promise<void> {
  const meta = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  const hasSheet = (meta.data.sheets ?? []).some(
    (s: any) => s.properties?.title === sheetTitle
  )
  if (hasSheet) return

  await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetTitle
            }
          }
        }
      ]
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
}

export async function writeValues({
  accessToken,
  spreadsheetId,
  sheetTitle,
  values,
  append
}: {
  accessToken: string
  spreadsheetId: string
  sheetTitle: string
  values: (string | number | null)[][]
  append?: boolean
}): Promise<void> {
  const range = `${sheetTitle}!A1`
  const url =
    append === true
      ? `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append`
      : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`

  const params =
    append === true ? { valueInputOption: 'RAW' } : { valueInputOption: 'RAW' }
  const method = append === true ? 'post' : 'put'

  await axios({
    method: method as 'post' | 'put',
    url,
    params,
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { values }
  })
}
