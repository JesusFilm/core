import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';

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

  async createAndPopulateSpreadsheet(
    data: unknown[][],
    accessToken: string,
    folderId: string,
  ): Promise<string> {
    const createUrl = 'https://www.googleapis.com/drive/v3/files';

    console.log(`Creating spreadsheet file...`);

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: `Nexus_Export_VideoData_${format(new Date(), 'yyyyMMddHHmmss')}`,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId],
      }),
    });

    if (!createResponse.ok) {
      throw new Error(
        `Failed to create spreadsheet file: ${await createResponse.text()}`,
      );
    }

    const createResult = await createResponse.json();
    const spreadsheetId = createResult.id;

    console.log(`Populating spreadsheet with id: ${spreadsheetId}...`);

    const populateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;

    await fetch(populateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: [
          {
            range: 'Sheet1',
            values: data,
          },
        ],
      }),
    });

    return spreadsheetId;
  }
}
