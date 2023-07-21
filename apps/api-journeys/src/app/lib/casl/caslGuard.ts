import { Injectable } from '@nestjs/common'
import { CaslFactory, CaslGuard } from '@core/nest/common/CaslAuthModule'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../prisma.service'

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
    const userRole = await this.prismaService.userRole.upsert({
      where: {
        userId
      },
      create: {
        userId
      },
      update: {}
    })
    return userRole.roles
  }
}
