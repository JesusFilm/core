import { Injectable } from '@nestjs/common'
import { UserRole } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class UserRoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserRoleById(userId: string): Promise<UserRole> {
    const response = await this.prismaService.userRole.findUnique({
      where: { userId }
    })

    return response != null
      ? response
      : await this.prismaService.userRole.create({
          data: { userId }
        })
  }
}
