/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyImageBlockDelete
// ====================================================

export interface JourneyImageBlockDelete_blockDelete_deletedBlocks {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface JourneyImageBlockDelete_blockDelete {
  __typename: "BlockDeleteResponse";
  deletedBlocks: JourneyImageBlockDelete_blockDelete_deletedBlocks[];
}

export interface JourneyImageBlockDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: JourneyImageBlockDelete_blockDelete;
}

export interface JourneyImageBlockDeleteVariables {
  id: string;
  journeyId: string;
}
