/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockActionDelete
// ====================================================

export interface BlockActionDelete_blockDeleteAction {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
}

export interface BlockActionDelete {
  blockDeleteAction: BlockActionDelete_blockDeleteAction;
}

export interface BlockActionDeleteVariables {
  id: string;
  journeyId: string;
}
