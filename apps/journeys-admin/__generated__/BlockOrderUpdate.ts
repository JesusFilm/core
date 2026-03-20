/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: BlockOrderUpdate
// ====================================================

export interface BlockOrderUpdate_blockOrderUpdate {
  __typename: "ImageBlock" | "StepBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "ButtonBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
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
