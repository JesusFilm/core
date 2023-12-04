import { Module } from '@nestjs/common';

import { PrismaService } from '../../lib/prisma.service'

import { NexusResolver } from './nexus.resolver'

@Module({
    imports: [],
    providers: [
        NexusResolver,
        PrismaService
    ]
})
export class NexusModule {}
