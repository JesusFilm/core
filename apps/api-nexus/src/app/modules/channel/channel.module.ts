import { Module } from '@nestjs/common';

import { PrismaService } from '../../lib/prisma.service'

import { ChannelResolver } from './channel.resolver'

@Module({
    imports: [],
    providers: [
        ChannelResolver,
        PrismaService
    ]
})
export class ChannelsModule {}
