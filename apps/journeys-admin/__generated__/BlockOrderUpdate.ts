/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockOrderUpdate
// ====================================================

export interface BlockOrderUpdate_blockOrderUpdate {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
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
