import { Controller, Get } from '@nestjs/common'

@Controller('mediaComponenents  ')
export class MediaComponenentsController {
  @Get()
  findAll() {
    return 'This action returns all mediaComponenents'
  }
  @Get(':mediaComponenentId')
  find() {
    return 'This action returns a mediaComponenent'
  }
}
