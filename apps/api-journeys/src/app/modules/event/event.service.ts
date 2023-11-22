import { Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql'

import { JourneyVisitor, Prisma, Visitor } from '.prisma/api-journeys-client'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'

import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

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
    const block = await this.prismaService.block.findUnique({
      where: { id: blockId },
      include: { action: true }
    })

    if (block == null) {
      throw new GraphQLError('Block does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    const journeyId = block.journeyId

    const visitorAndJourneyVisitor =
      await this.visitorService.getByUserIdAndJourneyId(userId, journeyId)

    if (visitorAndJourneyVisitor == null) {
      throw new GraphQLError('Visitor does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    const { visitor, journeyVisitor } = visitorAndJourneyVisitor

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
        { extensions: { code: 'NOT_FOUND' } }
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
