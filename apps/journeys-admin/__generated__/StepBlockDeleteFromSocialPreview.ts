/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepBlockDeleteFromSocialPreview
// ====================================================

export interface StepBlockDeleteFromSocialPreview_blockDelete_ImageBlock {
  __typename: "ImageBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromSocialPreview_blockDelete_StepBlock {
  __typename: "StepBlock";
  id: string;
  parentOrder: number | null;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export type StepBlockDeleteFromSocialPreview_blockDelete = StepBlockDeleteFromSocialPreview_blockDelete_ImageBlock | StepBlockDeleteFromSocialPreview_blockDelete_StepBlock;

export interface StepBlockDeleteFromSocialPreview_blockOrderUpdate {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface StepBlockDeleteFromSocialPreview {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: StepBlockDeleteFromSocialPreview_blockDelete[];
  blockOrderUpdate: StepBlockDeleteFromSocialPreview_blockOrderUpdate[];
}

export interface StepBlockDeleteFromSocialPreviewVariables {
  id: string;
  journeyId: string;
  parentOrder: number;
  stepId: string;
}
