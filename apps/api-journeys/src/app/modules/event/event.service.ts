import { Injectable, Inject } from '@nestjs/common'
import { BaseService } from '@core/nest/database/BaseService'
import { UserInputError } from 'apollo-server-errors'
import { Visitor } from '.prisma/api-journeys-client'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

@Injectable()
export class EventService extends BaseService {
  @Inject(BlockService)
  private readonly blockService: BlockService

  @Inject(VisitorService)
  private readonly visitorService: VisitorService

  collection = this.db.collection('events')

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
      throw new UserInputError('Block does not exist')
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
      throw new UserInputError(
        `Step ID ${
          stepId as string
        } does not exist on Journey with ID ${journeyId}`
      )
    }

    return { visitor, journeyId }
  }
}
