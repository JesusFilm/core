/* eslint-disable @typescript-eslint/no-misused-promises */
import { createReadStream, statSync } from 'fs';

import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';

interface Credential {
  client_secret: string;
  client_id: string;
  redirect_uris: string[];
}

@Injectable()
export class YoutubeService {
  private readonly credential: Credential;

  constructor() {
    this.credential = {
      client_secret: process.env.CLIENT_SECRET ?? '',
      client_id: process.env.CLIENT_ID ?? '',
      redirect_uris: ['https://localhost:4200'],
    };
  }

  authorize(token: string): OAuth2Client {
    const oAuth2Client = new google.auth.OAuth2(
      this.credential.client_id,
      this.credential.client_secret,
      this.credential.redirect_uris[0],
    );
    oAuth2Client.setCredentials({
      access_token: token,
      scope: 'https://www.googleapis.com/auth/youtube.upload',
    });
    return oAuth2Client;
  }

  async uploadVideo(
    youtubeData: {
      token: string;
      filePath: string;
      channelId: string;
      title: string;
      description: string;
    },
    progressCallback?: (progress: number) => Promise<void>,
  ): Promise<unknown> {
    const service = google.youtube('v3');
    const fileSize = statSync(youtubeData.filePath).size;

    return await service.videos.insert(
      {
        auth: this.authorize(youtubeData.token),
        part: ['id', 'snippet', 'status'],
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: youtubeData.title,
            description: youtubeData.description,
            channelId: youtubeData.channelId,
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: createReadStream(youtubeData.filePath),
        },
      },
      {
        onUploadProgress: async (evt) => {
          const progress = (evt.bytesRead / fileSize) * 100;
          if (progressCallback != null) {
            await progressCallback(progress);
          }
        },
      },
    );
  }
}
