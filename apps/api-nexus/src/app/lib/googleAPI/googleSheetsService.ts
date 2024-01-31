import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleSheetsService {
  async getFirstSheetName(
    spreadsheetId: string,
    accessToken: string,
  ): Promise<string> {
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    const response = await fetch(metadataUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const metadata = await response.json();
    return metadata.sheets[0].properties.title;
  }

  async downloadSpreadsheet(
    spreadsheetId: string,
    sheetName: string,
    accessToken: string,
  ): Promise<unknown[][]> {
    const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetName,
    )}`;
    const response = await fetch(sheetsApiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.values;
  }
}
