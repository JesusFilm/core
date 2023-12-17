import { Module } from '@nestjs/common';

import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { PrismaService } from '../../lib/prisma.service'

import { NexusResolver } from './nexus.resolver'

@Module({
    imports: [],
    providers: [
        NexusResolver,
        DateTimeScalar,
        PrismaService
    ]
})
export class NexusModule {}