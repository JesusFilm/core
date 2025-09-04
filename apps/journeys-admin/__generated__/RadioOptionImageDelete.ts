/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RadioOptionImageDelete
// ====================================================

export interface RadioOptionImageDelete_blockDelete {
  __typename: "ButtonBlock" | "CardBlock" | "GridContainerBlock" | "GridItemBlock" | "IconBlock" | "ImageBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "StepBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface RadioOptionImageDelete_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
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
