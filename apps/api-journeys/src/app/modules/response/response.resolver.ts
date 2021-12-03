import { UseGuards } from '@nestjs/common';
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql';
import { RadioQuestionResponse, RadioQuestionResponseCreateInput, SignUpResponse, SignUpResponseCreateInput, VideoResponse, VideoResponseCreateInput } from '../../graphql';
import { IdAsKey } from '../../lib/decorators';
import { AuthGuard } from '../auth/auth.guard';
import { ResponseService } from './response.service';

@Resolver('Response')
export class ResponseResolver {
  constructor(private readonly responseservice: ResponseService) { }
  @ResolveField()
  __resolveType(obj: Response): string {
    return obj.type;
  }

  @Mutation()
  @IdAsKey()
  async radioQuestionResponseCreate(
      @Args('input') input: RadioQuestionResponseCreateInput
  ): Promise<RadioQuestionResponse> {
      input.type = 'RadioQuestionResponse';
      return await this.responseservice.save(input)
  }

  @Mutation()
  @IdAsKey()
  @UseGuards(new AuthGuard())
  async signUpResponseCreate(
      @Args('input') input: SignUpResponseCreateInput,      
  ): Promise<SignUpResponse> {
      input.type = 'SignUpResponse';
      return await this.responseservice.save(input)
  }

  @Mutation()
  @IdAsKey()
  async videoResponseCreate(
      @Args('input') input: VideoResponseCreateInput
  ): Promise<VideoResponse> {
    input.type = 'VideoResponse';
      return await this.responseservice.save(input)
  }
}
