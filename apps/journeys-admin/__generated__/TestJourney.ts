/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TestJourney
// ====================================================

export interface TestJourney_journey_blocks {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface TestJourney_journey {
  __typename: "Journey";
  id: string;
  blocks: TestJourney_journey_blocks[] | null;
}

export interface TestJourney {
  journey: TestJourney_journey;
}

export interface TestJourneyVariables {
  id: string;
}
