import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { MemberService } from './member.service'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [MemberService],
  exports: [MemberService]
})
export class MemberModule {}
