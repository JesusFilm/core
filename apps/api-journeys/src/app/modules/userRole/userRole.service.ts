import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class UserRoleService extends BaseService {
  collection: DocumentCollection = this.db.collection('userRoles')
}
