import { createWriteStream } from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common/decorators/core';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface FileRequest {
  fileId: string;
  accessToken: string;
}

interface FileResponse {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string;
}

@Injectable()
export class GoogleDriveService {
  rootUrl: string;
  constructor() {
    this.rootUrl = 'https://www.googleapis.com/drive/v3';
  }

  async getFile(req: FileRequest): Promise<FileResponse> {
    const response = await fetch(
      `${this.rootUrl}/files/${req.fileId}?fields=id,thumbnailLink,name,mimeType,kind`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      },
    );

    return await response.json();
  }

  async setFilePermission(req: {
    fileId: string;
    accessToken: string;
  }): Promise<void> {
    await fetch(`${this.rootUrl}/files/${req.fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  }

  async downloadDriveFile(
    fileId: string,
    accessToken: string,
    progressCallback?: (progress: number) => Promise<void>,
  ): Promise<string> {
    await this.setFilePermission({ fileId, accessToken });
    const fileUrl = this.getFileUrl(fileId);
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    });

    const filename = response.headers['content-disposition']
      .split('filename=')[1]
      .split(';')[0]
      .replace(/["']/g, '');

    const downloadDirectory = path.join(__dirname, '..', 'downloads');
    const fileName = uuidv4() + path.extname(filename);
    const outputPath = path.join(downloadDirectory, fileName);
    const writer = createWriteStream(outputPath);

    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;
    response.data.on('data', async (chunk: Buffer) => {
      downloadedLength += chunk.length;
      const percentage = ((downloadedLength / totalLength) * 100).toFixed(2);
      if (progressCallback != null) {
        await progressCallback(Number(percentage));
      }
      console.log(`${fileName} Downloaded: ${percentage}%`);
    });
    response.data.pipe(writer);
    return await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }

  getFileUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
}
