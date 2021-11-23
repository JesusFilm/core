import { Field, InterfaceType, ObjectType } from "@nestjs/graphql"
import { Journey } from "../journey/journey.models";

@InterfaceType()
export abstract class Action {
  @Field()
  readonly gtmEventName: string;
}

@ObjectType({ implements: ()=> [Action], description: `NavigateAction is an Action that navigates to the nextBlockId field set on the
closest ancestor StepBlock.`})
export class NavigateAction extends Action {
}

@ObjectType({ implements: () => Action})
export class NavigateToBlockAction extends Action {
  @Field()
  readonly blockId: string
}

@ObjectType({ implements: () => [Action]})
export class NavigateToJourneyAction extends Action {
  @Field(type => Journey)
  readonly journey: Journey
}

@ObjectType({ implements: () => [Action]})
export class LinkAction extends Action {
  @Field()
  readonly url: string

  @Field()
  readonly target?: string
}