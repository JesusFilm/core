import { ResolveField, Resolver } from '@nestjs/graphql'
import { Action } from '../../graphql'

@Resolver('Action')
export class ActionResolver {
  @ResolveField()
  __resolveType(obj: Action): string {
    if (obj.hasOwnProperty('blockId'))
      return 'NavigateToBlockAction'
    if (obj.hasOwnProperty('journeyId'))
      return 'NavigateToJourneyAction'
    if (obj.hasOwnProperty('url'))
      return 'LinkAction'
    return 'NavigateAction'
  }
}


