import { Inject, Injectable } from '@nestjs/common'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { UserInputError } from 'apollo-server'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

@Injectable()
export class EventService extends BaseService {
  @Inject(BlockService)
  private readonly blockService: BlockService

  @Inject(VisitorService)
  private readonly visitorService: VisitorService

  collection: DocumentCollection = this.db.collection('events')

  @KeyAsId()
  async validateBlockEvent(
    userId: string,
    blockId: string,
    stepId: string
  ): Promise<{ visitorId: string; journeyId: string }> {
    const block: { journeyId: string; _key: string } | undefined =
      await this.blockService.get(blockId)

    if (block == null) {
      throw new UserInputError('Block does not exist')
    }
    const journeyId = block.journeyId

    const visitor: { id: string } =
      await this.visitorService.getByUserIdAndJourneyId(userId, journeyId)

    const validStep = await this.blockService.validateBlock(
      stepId,
      journeyId,
      'journeyId'
    )

    if (!validStep) {
      throw new UserInputError(
        `Step ID ${stepId} does not exist on Journey with ID ${journeyId}`
      )
    }

    return { visitorId: visitor.id, journeyId }
  }
}
