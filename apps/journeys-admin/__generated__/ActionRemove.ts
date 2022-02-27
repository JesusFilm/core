/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ActionRemove
// ====================================================

export interface ActionRemove_blockDeleteAction {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface ActionRemove {
  blockDeleteAction: ActionRemove_blockDeleteAction;
}

export interface ActionRemoveVariables {
  id: string;
  journeyId: string;
}
