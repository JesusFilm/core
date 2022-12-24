import { Injectable, Inject } from '@nestjs/common'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { GraphQLError } from 'graphql'
import { aql } from 'arangojs'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'
import { Visitor, Event } from '../../__generated__/graphql'

@Injectable()
export class EventService extends BaseService {
  @Inject(BlockService)
  private readonly blockService: BlockService

  @Inject(VisitorService)
  private readonly visitorService: VisitorService

  collection: DocumentCollection = this.db.collection('events')

  async validateBlockEvent(
    userId: string,
    blockId: string,
    stepId: string | null = null
  ): Promise<{
    visitor: Visitor
    journeyId: string
  }> {
    const block: { journeyId: string; _key: string } | undefined =
      await this.blockService.get(blockId)

    if (block == null) {
      throw new GraphQLError('Block does not exist', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }
    const journeyId = block.journeyId

    const visitor = await this.visitorService.getByUserIdAndJourneyId(
      userId,
      journeyId
    )

    const validStep = await this.blockService.validateBlock(
      stepId,
      journeyId,
      'journeyId'
    )

    if (!validStep) {
      throw new GraphQLError(
        `Step ID ${
          stepId as string
        } does not exist on Journey with ID ${journeyId}`,
        {
          extensions: { code: 'BAD_USER_INPUT' }
        }
      )
    }

    return { visitor, journeyId }
  }

  @KeyAsId()
  async getAllByVisitorId(visitorId: string): Promise<Event[]> {
    const res = await this.db.query(aql`
      FOR event IN ${this.collection}
        FILTER event.visitorId == ${visitorId}
        RETURN event
    `)
    return await res.all()
  }
}
