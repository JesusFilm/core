import { Injectable } from '@nestjs/common'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class VideoTagService extends BaseService {
  collection: DocumentCollection = this.db.collection('videoTags')
}
