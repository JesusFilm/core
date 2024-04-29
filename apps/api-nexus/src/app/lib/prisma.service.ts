import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient as LanguagePrismaClient } from '.prisma/api-languages-client';
import { PrismaClient } from '.prisma/api-nexus-client';
import { PrismaClient as VideoPrismaClient } from '.prisma/api-videos-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}

@Injectable()
export class VideoPrismaService
  extends VideoPrismaClient
  implements OnModuleInit
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}

@Injectable()
export class LanguagePrismaService
  extends LanguagePrismaClient
  implements OnModuleInit
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
