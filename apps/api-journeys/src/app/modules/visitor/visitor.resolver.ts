import { Args, Resolver, Query } from '@nestjs/graphql'
import { IQuery, VisitorsConnection } from '../../__generated__/graphql'
import { VisitorService } from './visitor.service'

@Resolver('UserJourney')
export class VisitorResolver implements Pick<IQuery, 'visitorsConnection'> {
  constructor(private readonly visitorService: VisitorService) {}

  @Query()
  async visitorsConnection(
    @Args('teamId') teamId: string,
    @Args('first') first?: number | null,
    @Args('after') after?: string | null
  ): Promise<VisitorsConnection> {
    return await this.visitorService.getList({
      filter: { teamId },
      first: first ?? 50,
      after
    })
  }
}
