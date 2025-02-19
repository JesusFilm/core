import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Action, VideoTriggerBlock } from '../../../__generated__/graphql'

@Resolver('VideoTriggerBlock')
export class VideoTriggerResolver {
  @ResolveField()
  action(@Parent() block: VideoTriggerBlock): Action {
    return {
      ...block.action,
      parentBlockId: block.id
    }
  }
}
