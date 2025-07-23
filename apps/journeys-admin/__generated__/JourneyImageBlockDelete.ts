/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyImageBlockDelete
// ====================================================

export interface JourneyImageBlockDelete_blockDelete {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface JourneyImageBlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: JourneyImageBlockDelete_blockDelete[];
}

export interface JourneyImageBlockDeleteVariables {
  id: string;
  journeyId: string;
}
