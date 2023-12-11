/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockOrderUpdate
// ====================================================

export interface BlockOrderUpdate_blockOrderUpdate {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface BlockOrderUpdate {
  blockOrderUpdate: BlockOrderUpdate_blockOrderUpdate[];
}

export interface BlockOrderUpdateVariables {
  id: string;
  journeyId: string;
  parentOrder: number;
}
