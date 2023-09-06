import { Controller, Get } from '@nestjs/common'

@Controller()
export class NestHealthController {
  @Get('/.well-known/apollo/server-health')
  getHealth(): string {
    return 'OK'
  }
}
