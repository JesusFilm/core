import { Controller, Get, HttpException } from '@nestjs/common'

type SelectResponse = Array<{ '?column?': number }> | null

@Controller()
export class NestHealthController {
  constructor() {}
  @Get('/.well-known/apollo/server-health')
  async getHealth(): Promise<string> {
    return 'OK'
  }
}
