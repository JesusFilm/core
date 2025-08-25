/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockOrderUpdate
// ====================================================

export interface BlockOrderUpdate_blockOrderUpdate {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "RadioQuestionBlock" | "RadioOptionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "VideoTriggerBlock" | "VideoBlock" | "TypographyBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockOrderUpdate {
  blockOrderUpdate: BlockOrderUpdate_blockOrderUpdate[];
}

export interface BlockOrderUpdateVariables {
  id: string;
  parentOrder: number;
}
