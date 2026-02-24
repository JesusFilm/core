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
    const url =
      'https://www.googleapis.com/drive/v3/files?fields=id%2C%20webViewLink'
    const driveRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId]
      })
    })
    if (!driveRes.ok) {
      throw new Error(
        `Drive create file failed: ${driveRes.status} ${await driveRes.text()}`
      )
    }
    const driveJson = await driveRes.json()
    const spreadsheetId: string = driveJson.id
    const spreadsheetUrl: string = driveJson.webViewLink

    // When Drive API creates a spreadsheet, it includes a default "Sheet1".
    // Rename it to the custom title instead of adding a new sheet.
    if (initialSheetTitle != null) {
      await renameDefaultSheet({
        accessToken,
        spreadsheetId,
        newTitle: initialSheetTitle
      })
    }

    return { spreadsheetId, spreadsheetUrl }
  }

  // Otherwise use Sheets API to create
  const sheetsRes = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { title },
        sheets:
          initialSheetTitle != null
            ? [{ properties: { title: initialSheetTitle } }]
            : undefined
      })
    }
  )
  if (!sheetsRes.ok) {
    throw new Error(
      `Sheets create spreadsheet failed: ${sheetsRes.status} ${await sheetsRes.text()}`
    )
  }
  const sheetsJson = await sheetsRes.json()
  return {
    spreadsheetId: sheetsJson.spreadsheetId,
    spreadsheetUrl: sheetsJson.spreadsheetUrl
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
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!metaRes.ok) {
    throw new Error(
      `Sheets metadata fetch failed: ${metaRes.status} ${await metaRes.text()}`
    )
  }
  const meta = await metaRes.json()

  const hasSheet = (meta.sheets ?? []).some(
    (s: any) => s.properties?.title === sheetTitle
  )
  if (hasSheet) return

  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle
              }
            }
          }
        ]
      })
    }
  )
  if (!batchRes.ok) {
    throw new Error(
      `Sheets batchUpdate failed: ${batchRes.status} ${await batchRes.text()}`
    )
  }
}

/**
 * Renames the first (default) sheet in a spreadsheet.
 * Used when creating spreadsheets via Drive API, which creates a default "Sheet1".
 */
export async function renameDefaultSheet({
  accessToken,
  spreadsheetId,
  newTitle
}: {
  accessToken: string
  spreadsheetId: string
  newTitle: string
}): Promise<void> {
  // Get spreadsheet metadata to find the first sheet's ID
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!metaRes.ok) {
    throw new Error(
      `Sheets metadata fetch failed: ${metaRes.status} ${await metaRes.text()}`
    )
  }
  const meta = await metaRes.json()

  const sheets = meta.sheets ?? []
  if (sheets.length === 0) {
    throw new Error('Spreadsheet has no sheets to rename')
  }

  // Get the first sheet's ID (the default sheet created by Drive API)
  const firstSheetId = sheets[0].properties?.sheetId
  if (firstSheetId == null) {
    throw new Error('Could not get first sheet ID')
  }

  // Rename the sheet using batchUpdate
  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: firstSheetId,
                title: newTitle
              },
              fields: 'title'
            }
          }
        ]
      })
    }
  )
  if (!batchRes.ok) {
    throw new Error(
      `Sheets rename failed: ${batchRes.status} ${await batchRes.text()}`
    )
  }
}

export async function writeValues({
  accessToken,
  spreadsheetId,
  sheetTitle,
  values,
  append,
  valueInputOption = 'RAW'
}: {
  accessToken: string
  spreadsheetId: string
  sheetTitle: string
  values: (string | number | null)[][]
  append?: boolean
  valueInputOption?: 'RAW' | 'USER_ENTERED'
}): Promise<void> {
  const range = `${sheetTitle}!A1`
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`
  const url =
    append === true
      ? `${baseUrl}:append?valueInputOption=${valueInputOption}`
      : `${baseUrl}?valueInputOption=${valueInputOption}`
  const method = append === true ? 'POST' : 'PUT'
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  })
  if (!res.ok) {
    throw new Error(
      `Sheets writeValues failed: ${res.status} ${await res.text()}`
    )
  }
}

// Read values for a given A1 range
export async function readValues({
  accessToken,
  spreadsheetId,
  range
}: {
  accessToken: string
  spreadsheetId: string
  range: string
}): Promise<(string | null)[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) {
    throw new Error(
      `Sheets readValues failed: ${res.status} ${await res.text()}`
    )
  }
  const json = await res.json()
  const values: (string | null)[][] = (json.values ?? []).map((row: any[]) =>
    row.map((v) => (v == null ? null : String(v)))
  )
  return values
}

// Convert a 0-based column index to A1 column letters
export function columnIndexToA1(colIndexZeroBased: number): string {
  let n = colIndexZeroBased + 1
  let s = ''
  while (n > 0) {
    const mod = (n - 1) % 26
    s = String.fromCharCode(65 + mod) + s
    n = Math.floor((n - mod) / 26)
  }
  return s
}

// Update a specific range with provided values (PUT)
export async function updateRangeValues({
  accessToken,
  spreadsheetId,
  range,
  values,
  valueInputOption = 'RAW'
}: {
  accessToken: string
  spreadsheetId: string
  range: string
  values: (string | number | null)[][]
  valueInputOption?: 'RAW' | 'USER_ENTERED'
}): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  })
  if (!res.ok) {
    throw new Error(
      `Sheets updateRangeValues failed: ${res.status} ${await res.text()}`
    )
  }
}

/**
 * Clear all data from a sheet while preserving the sheet itself.
 * Used for backfill operations that need to replace all content.
 */
export async function clearSheet({
  accessToken,
  spreadsheetId,
  sheetTitle
}: {
  accessToken: string
  spreadsheetId: string
  sheetTitle: string
}): Promise<void> {
  const range = `${sheetTitle}!A:ZZ`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) {
    throw new Error(
      `Sheets clearSheet failed: ${res.status} ${await res.text()}`
    )
  }
}
