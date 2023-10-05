import { Injectable } from '@nestjs/common'

import { UserRole } from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'

const ERROR_INVALID_UPSERT_INVOCATION = 'P2014'

@Injectable()
export class UserRoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserRoleById(userId: string): Promise<UserRole> {
    try {
      return await this.prismaService.userRole.upsert({
        where: { userId },
        create: { userId },
        update: {}
      })
    } catch (err) {
      if (err.code !== ERROR_INVALID_UPSERT_INVOCATION) {
        throw err
      }
    }
    return await this.getUserRoleById(userId)
  }
}
