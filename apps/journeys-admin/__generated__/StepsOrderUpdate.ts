/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepsOrderUpdate
// ====================================================

export interface StepsOrderUpdate_blockOrderUpdate {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "FormBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepsOrderUpdate {
  blockOrderUpdate: StepsOrderUpdate_blockOrderUpdate[];
}

export interface StepsOrderUpdateVariables {
  id: string;
  journeyId: string;
  parentOrder: number;
}
