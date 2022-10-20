import { Args, Resolver, Query } from '@nestjs/graphql'
import { IQuery, VisitorTeamsConnection } from '../../__generated__/graphql'
import { VisitorTeamService } from './visitorTeam.service'

@Resolver('UserJourney')
export class VisitorTeamResolver
  implements Pick<IQuery, 'visitorTeamsConnection'>
{
  constructor(private readonly visitorTeamService: VisitorTeamService) {}

  @Query()
  async visitorTeamsConnection(
    @Args('teamId') teamId: string,
    @Args('first') first?: number | null,
    @Args('after') after?: string | null
  ): Promise<VisitorTeamsConnection> {
    return await this.visitorTeamService.getList({
      filter: { teamId },
      first: first ?? 50,
      after
    })
  }
}
