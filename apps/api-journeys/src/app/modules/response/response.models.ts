import { Field, ID, Int, InterfaceType, ObjectType } from "@nestjs/graphql"
import { Block, RadioQuestionBlock, SignUpBlock, VideoBlock } from "../block/block.models"
import { VideoResponseStateEnum } from "../video/video.models"

@InterfaceType({
    resolveType(obj): any {
        switch(obj.type) {
          case 'RadioQuestionResponse':
            return RadioQuestionResponse;
          case 'SignUpResponse':
            return SignUpResponse;
          case 'VideoResponse':
            return VideoResponse;
          default:
            return Response;
        }
      }
})
export abstract class Response {
  @Field(type => ID)
  readonly id: string

  @Field(type => ID)
  readonly userId: string

  type: string;  
}

@ObjectType({ implements: () => [Response]})
export class RadioQuestionResponse extends Response {
    type: 'RadioQuestionResponse'
    @Field(type => RadioQuestionBlock)
    readonly block?: RadioQuestionBlock

    @Field(type => ID)
    readonly radioOptionBlockId: string
}

@ObjectType({ implements: () => Response})
export class SignUpResponse extends Response {
    @Field()
    readonly name: string

    @Field()
    readonly email: string

    @Field(type => Block)
    readonly block?: SignUpBlock
}
@ObjectType({ implements: () => [Response]})
export class VideoResponse extends Response {
    @Field(type => VideoResponseStateEnum)
    readonly state: VideoResponseStateEnum

    @Field(type => Int)
    readonly position?: number

    @Field(type => VideoBlock)
    readonly block?: VideoBlock
}