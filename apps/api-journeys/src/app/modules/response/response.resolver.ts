import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RadioQuestionResponse, RadioQuestionResponseCreateInput, SignUpResponse, SignUpResponseCreateInput, VideoResponse, VideoResponseCreateInput } from '../../graphql';
import { ResponseService } from './response.service';

@Resolver('Response')
export class ResponseResolver {
  constructor(private readonly responseservice: ResponseService) { }
  @Mutation()
  async radioQuestionResponseCreate(
      @Args('input') input: RadioQuestionResponseCreateInput
  ): Promise<RadioQuestionResponse> {
      return await this.responseservice.save(input)
  }

  @Mutation()
  async signUpResponseCreate(
      @Args('input') input: SignUpResponseCreateInput
  ): Promise<SignUpResponse> {
      return await this.responseservice.save(input)
  }

  @Mutation()
  async videoResponseCreate(
      @Args('input') input: VideoResponseCreateInput
  ): Promise<VideoResponse> {
      return await this.responseservice.save(input)
  }
}
