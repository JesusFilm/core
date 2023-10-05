import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { CaslFactory, CaslGuard } from '@core/nest/common/CaslAuthModule'

import { PrismaService } from '../prisma.service'

const ERROR_INVALID_UPSERT_INVOCATION = 'P2014'

@Injectable()
export class AppCaslGuard extends CaslGuard {
  constructor(
    _reflector: Reflector,
    _caslFactory: CaslFactory,
    private readonly prismaService: PrismaService
  ) {
    super(_reflector, _caslFactory)
  }

  protected override async loadRoles(userId: string): Promise<string[]> {
    try {
      const userRole = await this.prismaService.userRole.upsert({
        where: { userId },
        create: { userId },
        update: {}
      })
      return userRole.roles
    } catch (err) {
      if (err.code !== ERROR_INVALID_UPSERT_INVOCATION) {
        throw err
      }
    }
    return await this.loadRoles(userId)
  }
}
