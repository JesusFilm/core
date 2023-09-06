import { Injectable } from '@nestjs/common'

import { UserRole } from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class UserRoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserRoleById(userId: string): Promise<UserRole> {
    return await this.prismaService.userRole.upsert({
      where: { userId },
      update: {},
      create: { userId }
    })
  }
}
