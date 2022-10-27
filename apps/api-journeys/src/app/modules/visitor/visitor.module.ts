import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { VisitorService } from './visitor.service'
import { VisitorResolver } from './visitor.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [VisitorService, VisitorResolver],
  exports: [VisitorService]
})
export class VisitorModule {}
