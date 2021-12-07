import { UserInputError } from 'apollo-server-errors'
import {
  Args,
  Mutation,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { VideoBlock, VideoBlockCreateInput, VideoBlockUpdateInput, VideoContent, VideoContentInput } from '../../../graphql'
import { AuthGuard } from '../../../lib/auth/auth.guard'
import { IdAsKey } from '../../../lib/decorators'
import { BlockService } from '../block.service'
import { UseGuards } from '@nestjs/common'

function checkVideoContentInput(input: VideoContentInput): boolean {
  return input?.hasOwnProperty('src')
   || (input?.hasOwnProperty('mediaComponentId') && input?.hasOwnProperty('languageId'))
}
@Resolver('VideoContent')
export class VideoContentResolvers {  
  @ResolveField()
  __resolveType(obj: VideoContent): string {
    if (obj.hasOwnProperty('mediaComponentId'))
      return 'VideoArclight'
    return 'VideoGeneric'
  }
}

@Resolver('VideoBlock')
export class VideoBlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
  @Mutation()
  @IdAsKey()
  @UseGuards(new AuthGuard())
  async videoBlockCreate(@Args('input') input: VideoBlockCreateInput): Promise<VideoBlock> {
    input.type = 'VideoBlock'
    if (checkVideoContentInput(input?.videoContent))
      return await this.blockservice.save(input)
    throw new UserInputError('VideoContentInput requires src or mediaComponentId and languageId values')
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async videoBlockUpdate(@Args('id') id: string, @Args('input') input: VideoBlockUpdateInput): Promise<VideoBlock> {
    return await this.blockservice.update(id, input)
  }
}