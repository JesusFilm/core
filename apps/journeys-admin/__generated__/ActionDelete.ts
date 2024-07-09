/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ActionDelete
// ====================================================

export interface ActionDelete_blockDeleteAction {
  __typename: "ButtonBlock" | "CardBlock" | "FormBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
}

export interface ActionDelete {
  blockDeleteAction: ActionDelete_blockDeleteAction;
}

export interface ActionDeleteVariables {
  id: string;
  journeyId: string;
}
