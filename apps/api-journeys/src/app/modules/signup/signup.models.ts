import { Field, ID, InputType } from "@nestjs/graphql"

@InputType()
export class SignUpResponseCreateInput {
    @Field(type => ID)
    readonly blockId: string

    @Field()
    readonly name: string

    @Field()
    readonly email: string
}
