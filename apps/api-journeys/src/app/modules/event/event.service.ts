import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Block } from '../../__generated__/graphql'

@Injectable()
export class EventService extends BaseService {
  collection: DocumentCollection = this.db.collection('events')

  @KeyAsId()
  async getBlockById(_key: string): Promise<Block> {
    const result = await this.db.query(aql`
      FOR block in blocks
        FILTER block._key == ${_key}
        LIMIT 1
        RETURN block
    `)
    return await result.next()
  }
}
