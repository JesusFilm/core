import { Module } from '@nestjs/common';

import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';

import { GoogleDriveService } from './googleDriveService';

@Module({
  imports: [],
  providers: [
    PrismaService,
    GoogleOAuthService,
    GoogleDriveService,
    YoutubeService,
    GoogleSheetsService,
  ],
})
export class GoogleDriveModule {}
