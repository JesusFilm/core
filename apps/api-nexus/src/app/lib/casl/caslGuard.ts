import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { CaslFactory, CaslGuard } from '@core/nest/common/CaslAuthModule'

@Injectable()
export class AppCaslGuard extends CaslGuard {
  constructor(_reflector: Reflector, _caslFactory: CaslFactory) {
    super(_reflector, _caslFactory)
  }
}
