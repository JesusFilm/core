import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { basename, join } from 'path';

import { Injectable } from '@nestjs/common/decorators/core';
import axios from 'axios';

export interface CloudflareVideoUrlUploadResponse {
  result: {
    uid: string;
  } | null;
  success: boolean;
  errors: string[];
  messages: string[];
}

@Injectable()
export class CloudFlareService {
  private readonly apiUrl = 'https://api.cloudflare.com/client/v4';
  private readonly downloadDirectory = join(__dirname, '..', 'downloads');

  constructor() {
    if (!existsSync(this.downloadDirectory)) {
      mkdirSync(this.downloadDirectory, { recursive: true });
    }
  }

  async uploadToCloudflareByUrl(
    url: string,
    fileName: string,
    userName: string,
  ): Promise<CloudflareVideoUrlUploadResponse> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/stream/copy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, creator: userName, name: fileName }),
      },
    );
    return await response.json();
  }

  async makeVideoPublic(videoId: string): Promise<void> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/media/${videoId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requireSignedURLs: false, allowedOrigins: [] }),
      },
    );

    const data = await response.json();
    console.log('makeVideoPublic', data);
  }

  async downloadFile(fileId: string, resourceId: string): Promise<string> {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const url = `${this.apiUrl}/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${fileId}/downloads`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });
    const fileUrl = res.data.result.default.url;
    const fileName = resourceId + basename(fileUrl);
    const outputPath = join(this.downloadDirectory, fileName);

    const writer = createWriteStream(outputPath);
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    });

    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;
    response.data.on('data', (chunk: Buffer) => {
      downloadedLength += chunk.length;
      const percentage = ((downloadedLength / totalLength) * 100).toFixed(2);
      console.log(`Downloaded: ${percentage}%`);
    });

    response.data.pipe(writer);

    return await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }
}
