/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RadioOptionImageDelete
// ====================================================

export interface RadioOptionImageDelete_blockDelete {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface RadioOptionImageDelete_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  pollOptionImageBlockId: string | null;
}

export interface RadioOptionImageDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  blockDelete: RadioOptionImageDelete_blockDelete[];
  radioOptionBlockUpdate: RadioOptionImageDelete_radioOptionBlockUpdate;
}

export interface RadioOptionImageDeleteVariables {
  id: string;
  radioOptionBlockId: string;
}
