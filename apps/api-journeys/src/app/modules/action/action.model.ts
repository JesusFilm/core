import { Field, InterfaceType } from "@nestjs/graphql"

@InterfaceType()
export abstract class Action {
  @Field()
  readonly gtmEventName: string;
}