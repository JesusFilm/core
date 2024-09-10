import { Controller, Get, HttpException } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

type SelectResponse = Array<{ '?column?': number }> | null

@Controller()
export class NestHealthController {
  constructor(private readonly prismaService: PrismaService) {}
  @Get('/.well-known/apollo/server-health')
  async getHealth(): Promise<string> {
    let result: SelectResponse
    try {
      result = await this.prismaService.$queryRaw`SELECT 1`
    } catch (e) {
      throw new HttpException('Not ready', 503)
    }
    if (result?.[0]['?column?'] !== 1) {
      throw new HttpException('Not ready', 503)
    }
    return 'OK'
  }
}
