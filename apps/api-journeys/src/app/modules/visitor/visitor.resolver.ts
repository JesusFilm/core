import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Parent,
  Mutation
} from '@nestjs/graphql'
import { ForbiddenError, UserInputError } from 'apollo-server'
import { IResult, UAParser } from 'ua-parser-js'
import { Visitor, VisitorsConnection } from '../../__generated__/graphql'
import { MemberService } from '../member/member.service'
import { VisitorService } from './visitor.service'

@Resolver('Visitor')
export class VisitorResolver {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly memberService: MemberService
  ) {}

  @Query()
  async visitorsConnection(
    @CurrentUserId() userId: string,
    @Args('teamId') teamId: string,
    @Args('first') first?: number | null,
    @Args('after') after?: string | null
  ): Promise<VisitorsConnection> {
    const memberResult = await this.memberService.getMemberByTeamId(
      userId,
      teamId
    )

    if (memberResult == null)
      throw new ForbiddenError('User is not a member of the team.')

    return await this.visitorService.getList({
      filter: { teamId },
      first: first ?? 50,
      after
    })
  }

  @Query()
  async visitor(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<Visitor> {
    const visitor = await this.visitorService.get<
      ({ teamId: string } & Visitor) | undefined
    >(id)

    if (visitor == null)
      throw new UserInputError(`Visitor with ID "${id}" does not exist`)

    const memberResult = await this.memberService.getMemberByTeamId(
      userId,
      visitor.teamId
    )

    if (memberResult == null)
      throw new ForbiddenError(
        'User is not a member of the team the visitor belongs to'
      )

    return visitor
  }

  @Mutation()
  async visitorUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input
  ): Promise<Visitor> {
    const visitor = await this.visitorService.get<
      ({ teamId: string } & Visitor) | undefined
    >(id)

    if (visitor == null)
      throw new UserInputError(`Visitor with ID "${id}" does not exist`)

    const memberResult = await this.memberService.getMemberByTeamId(
      userId,
      visitor.teamId
    )

    if (memberResult == null)
      throw new ForbiddenError(
        'User is not a member of the team the visitor belongs to'
      )

    return await this.visitorService.update(id, input)
  }

  @ResolveField()
  userAgent(@Parent() visitor): IResult | undefined {
    if (visitor.userAgent != null)
      return new UAParser(visitor.userAgent).getResult()
  }
}
