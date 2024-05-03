import { createReadStream, statSync } from 'fs';

import { BadRequestException, Injectable } from '@nestjs/common';
import { google, youtube_v3 } from 'googleapis';
import { GaxiosPromise, OAuth2Client } from 'googleapis-common';

import { GoogleOAuthService } from './oauth.service';

interface Credential {
  client_secret: string;
  client_id: string;
  redirect_uris: string[];
}

@Injectable()
export class GoogleYoutubeService {
  private readonly credential: Credential;

  constructor(private readonly googleService: GoogleOAuthService) {
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
      scope:
        'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube.upload',
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
      defaultLanguage: string;
      privacyStatus?: string;
    },
    progressCallback?: (progress: number) => Promise<void>,
  ): GaxiosPromise<youtube_v3.Schema$Video> {
    const service = google.youtube('v3');
    const fileSize = statSync(youtubeData.filePath).size;
    try {
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
              defaultLanguage: youtubeData.defaultLanguage ?? 'en',
              categoryId: '22',
            },
            status: {
              privacyStatus: youtubeData.privacyStatus ?? 'private',
            },
          },
          media: {
            body: createReadStream(youtubeData.filePath),
          },
        },
        {
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileSize) * 100;
            void Promise.all([this.executeCallback(progressCallback, progress)]);
          },
        },
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async executeCallback(
    progressCallback: ((arg0: number) => Promise<void>) | null | undefined,
    progress: number
  ): Promise<void> {
    if (progressCallback != null) {
      await progressCallback(progress)
    }
  }

  async updateVideo(youtubeData: {
    token: string;
    videoId: string;
    title?: string;
    description?: string;
    defaultLanguage?: string;
    privacyStatus?: string;
    localizations: Array<{
      resourceId?: string;
      title?: string;
      description?: string;
      tags?: string[];
      language: string;
      captionDriveId?: string;
    }>
  }): GaxiosPromise<youtube_v3.Schema$Video> {
    const service = google.youtube('v3');
    let uploadedYoutubeResponse;
    try {
      const convertedLocalizations = {};
      youtubeData.localizations?.forEach((item) => {
        convertedLocalizations[item.language] = {
          title: item.title,
          description: item.description,
        };
      });
      uploadedYoutubeResponse = await service.videos.update({
        auth: this.authorize(youtubeData.token),
        part: ['snippet', 'localizations'],
        requestBody: {
          id: youtubeData.videoId,
          snippet: {
            title: youtubeData.title,
            description: youtubeData.description,
          },
          status: {
            privacyStatus: youtubeData.privacyStatus,
          },
          localizations: convertedLocalizations,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    return uploadedYoutubeResponse;
  }

  async updateVideoThumbnail(youtubeData: {
    token: string;
    videoId: string;
    thumbnailPath: string;
    mimeType: string;
  }): Promise<unknown> {
    const service = google.youtube('v3');

    return await service.thumbnails.set({
      auth: this.authorize(youtubeData.token),
      videoId: youtubeData.videoId,
      media: {
        mimeType: youtubeData.mimeType,
        body: createReadStream(youtubeData.thumbnailPath),
      },
    });
  }

  async uploadCaption(youtubeData: {
    token: string;
    videoId: string;
    language: string;
    name: string;
    captionFile: string;
    isDraft: boolean;
    mimeType: string;
  }): Promise<unknown> {
    const service = google.youtube('v3');
    const auth = this.authorize(youtubeData.token);

    const captionData = {
      auth,
      part: ['snippet'],
      requestBody: {
        snippet: {
          videoId: youtubeData.videoId,
          language: youtubeData.language,
          name: youtubeData.name,
          isDraft: youtubeData.isDraft,
        },
      },
      media: {
        mimeType: youtubeData.mimeType,
        body: createReadStream(youtubeData.captionFile),
      },
    };

    return await service.captions.insert(captionData);
  }
}