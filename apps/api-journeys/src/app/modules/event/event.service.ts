import { Injectable } from '@nestjs/common'
import { UserInputError } from 'apollo-server-errors'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { Prisma, Visitor, JourneyVisitor } from '.prisma/api-journeys-client'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class EventService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly blockService: BlockService,
    private readonly visitorService: VisitorService
  ) {}

  async validateBlockEvent(
    userId: string,
    blockId: string,
    stepId: string | null = null
  ): Promise<{
    visitor: Visitor
    journeyVisitor: JourneyVisitor
    journeyId: string
  }> {
    const block: { journeyId: string; _key: string } | undefined =
      await this.blockService.get(blockId)

    if (block == null) {
      throw new UserInputError('Block does not exist')
    }
    const journeyId = block.journeyId

    const { visitor, journeyVisitor } =
      await this.visitorService.getByUserIdAndJourneyId(userId, journeyId)

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

    return { visitor, journeyVisitor, journeyId }
  }

  @FromPostgresql()
  async save<T>(input: Prisma.EventCreateInput): Promise<T> {
    return (await this.prismaService.event.create({
      data: input
    })) as unknown as T
  }
}
