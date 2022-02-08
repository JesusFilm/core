import { ResolveField, Resolver } from '@nestjs/graphql'
import { get } from 'lodash'
import { Action } from '../../__generated__/graphql'

@Resolver('Action')
export class ActionResolver {
  @ResolveField()
  __resolveType(obj: Action): string {
    if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
    if (get(obj, 'journeyId') != null) return 'NavigateToJourneyAction'
    if (get(obj, 'url') != null) return 'LinkAction'
    return 'NavigateAction'
  }
}
