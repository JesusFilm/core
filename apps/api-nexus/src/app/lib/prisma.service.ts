import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '.prisma/api-nexus-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
