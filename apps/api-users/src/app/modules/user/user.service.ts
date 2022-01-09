import { BaseService } from '@core/nest/database'
import { Injectable } from '@nestjs/common'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class UserService extends BaseService {
  collection: DocumentCollection = this.db.collection('users')
}
