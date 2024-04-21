import { sheets } from '@googleapis/sheets'
import { Injectable } from '@nestjs/common'

@Injectable()
export class GoogleSheetsService {
  async getFirstSheetName(
    spreadsheetId: string,
    accessToken: string
  ): Promise<string | undefined> {
    const client = sheets({ version: 'v4', auth: accessToken })
    const res = await client.spreadsheets.get({ spreadsheetId })
    return res.data.sheets?.[0].properties?.title ?? undefined
  }

  async downloadSpreadsheet(
    spreadsheetId: string,
    sheetName: string,
    accessToken: string
  ): Promise<unknown[][] | undefined> {
    const client = sheets({ version: 'v4', auth: accessToken })
    const res = await client.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName
    })
    return res.data.values ?? undefined
  }
}
