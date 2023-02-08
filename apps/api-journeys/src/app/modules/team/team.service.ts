import { Injectable } from '@nestjs/common'
import { BaseService } from '@core/nest/database/BaseService'

@Injectable()
export class TeamService extends BaseService {
  collection = this.db.collection('teams')
}
