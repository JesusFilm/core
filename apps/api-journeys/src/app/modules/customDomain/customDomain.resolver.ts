import { Query, Resolver } from '@nestjs/graphql'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('CustomDomain')
export class CustomDomainResolver {
  constructor(private readonly prismaService: PrismaService) {}

  // @Query()
  // async customDomain() {
  //   return 'customDomain'
  // }
}
