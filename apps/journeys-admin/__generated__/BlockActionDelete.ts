/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockActionDelete
// ====================================================

export interface BlockActionDelete_blockDeleteAction {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
}

export interface BlockActionDelete {
  blockDeleteAction: BlockActionDelete_blockDeleteAction | null;
}

export interface BlockActionDeleteVariables {
  id: string;
}
