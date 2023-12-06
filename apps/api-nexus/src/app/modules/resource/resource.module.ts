import { Module } from '@nestjs/common';

import { PrismaService } from '../../lib/prisma.service'

import { ResourceResolver } from './resource.resolver'

@Module({
    imports: [],
    providers: [
        ResourceResolver,
        PrismaService
    ]
})
export class ResourceModule {}
