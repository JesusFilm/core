import { Field, ID, InputType, ObjectType } from "@nestjs/graphql"
import { Block } from "../block/block.models"
import { Response } from "../response/response.models"

@ObjectType({ implements: () => [Block]})
export class RadioQuestionBlock extends Block {
  @Field()
  readonly label: string

  @Field()
  readonly description?: string
}

@ObjectType({ implements: () => [Response]})
export class RadioQuestionResponse extends Response {
    @Field(type => RadioQuestionBlock)
    readonly block?: RadioQuestionBlock

    @Field(type => ID)
    readonly radioOptionBlockId: string
}

@InputType()
export class RadioQuestionResponseCreateInput {
    @Field(type => RadioQuestionBlock)
    readonly block?: RadioQuestionBlock

    @Field(type => ID)
    readonly radioOptionBlockId: string
}