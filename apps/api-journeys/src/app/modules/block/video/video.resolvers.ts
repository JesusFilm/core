import {
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { VideoContent } from '../../../graphql'

@Resolver('VideoContent')
export class VideoContentResolvers {
  @ResolveField()
  __resolveType(obj: VideoContent): string {
    if (obj.hasOwnProperty('mediaComponentId'))
      return 'VideoArclight'
    return 'VideoGeneric'
  }
}