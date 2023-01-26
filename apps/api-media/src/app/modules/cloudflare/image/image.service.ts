import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class ImageService extends BaseService {
  collection: DocumentCollection = this.db.collection('cloudflareImages')
}
