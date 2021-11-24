import { Field, ID, InputType } from "@nestjs/graphql"

@InputType()
export class RadioQuestionResponseCreateInput {
    @Field(type => ID)
    readonly blockId?: string

    @Field(type => ID)
    readonly radioOptionBlockId: string
}