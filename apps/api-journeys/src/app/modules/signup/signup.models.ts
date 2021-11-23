import { Field, ID, InputType, ObjectType } from "@nestjs/graphql"
import { Action } from "../action/action.model"
import { Block, SignUpBlock } from "../block/block.models"
import { Icon } from "../icon/icon.models"
import { Response } from "../response/response.models"

@InputType()
export class SignUpResponseCreateInput {
    @Field(type => ID)
    readonly blockId: string

    @Field()
    readonly name: string

    @Field()
    readonly email: string
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

//   extend type Mutation {
//     signUpResponseCreate(input: SignUpResponseCreateInput!): SignUpResponse!
//   }