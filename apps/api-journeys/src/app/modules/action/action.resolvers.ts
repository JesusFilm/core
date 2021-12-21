import { ResolveField, Resolver } from '@nestjs/graphql'
import { Action } from '../../__generated__/graphql'
import { has } from 'lodash'

@Resolver('Action')
export class ActionResolver {
  @ResolveField()
  __resolveType(obj: Action): string {
    if (has(obj, ['blockId'])) return 'NavigateToBlockAction'
    if (has(obj, ['journeyId'])) return 'NavigateToJourneyAction'
    if (has(obj, ['url'])) return 'LinkAction'
    return 'NavigateAction'
  }
}
