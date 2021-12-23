import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'

@Module({
  imports: [DatabaseModule],
  providers: [UserResolver, UserService],
  exports: [UserService]
})
export class UserModule {}
