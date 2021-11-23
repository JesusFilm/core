import { Field, ID, Int, InterfaceType, ObjectType } from "@nestjs/graphql"
import { RadioQuestionBlock, VideoBlock } from "../block/block.models"
import { VideoResponseStateEnum } from "../video/video.models"

@InterfaceType()
export abstract class Response {
  @Field(type => ID)
  readonly id: string

  @Field(type => ID)
  readonly userId: string
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