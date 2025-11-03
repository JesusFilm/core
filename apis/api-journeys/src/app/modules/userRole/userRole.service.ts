import { Injectable } from '@nestjs/common'

import { UserRole } from '@core/prisma/journeys/client'

import { PrismaService } from '../../lib/prisma.service'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'

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
      if (err.code !== ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
        throw err
      }
    }
    return await this.getUserRoleById(userId)
  }
}
