import { Field, InterfaceType, ObjectType } from "@nestjs/graphql"
import { Journey } from "../journey/journey.models";

@InterfaceType({
  resolveType(obj) {
    if (obj.blockId !== null)
      return NavigateToBlockAction;
    if (obj.journeyId !== null)
      return NavigateToJourneyAction;
    if (obj.url !== null)
      return LinkAction;
    return NavigateAction;
  }
})
export abstract class Action {
  @Field()
  readonly gtmEventName: string;
}

@ObjectType({ implements: ()=> [Action], description: `NavigateAction is an Action that navigates to the nextBlockId field set on the
closest ancestor StepBlock.`})
export class NavigateAction extends Action {}

@ObjectType({ implements: () => Action})
export class NavigateToBlockAction extends Action {
  @Field({ nullable: true })
  readonly blockId: string
}

@ObjectType({ implements: () => [Action]})
export class NavigateToJourneyAction extends Action {
  @Field(type => Journey, { nullable: true })
  readonly journey: Journey
}

@ObjectType({ implements: () => [Action]})
export class LinkAction extends Action {
  @Field({ nullable: true })
  readonly url: string

  @Field()
  readonly target?: string
}