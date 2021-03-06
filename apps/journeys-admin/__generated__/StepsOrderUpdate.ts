/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepsOrderUpdate
// ====================================================

export interface StepsOrderUpdate_blockOrderUpdate {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
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
