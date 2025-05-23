/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TextResponseWithButtonDelete
// ====================================================

export interface TextResponseWithButtonDelete_endIcon {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock" | "VideoBlockContent";
  id: string;
  parentOrder: number | null;
}

export interface TextResponseWithButtonDelete_startIcon {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock" | "VideoBlockContent";
  id: string;
  parentOrder: number | null;
}

export interface TextResponseWithButtonDelete_button {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock" | "VideoBlockContent";
  id: string;
  parentOrder: number | null;
}

export interface TextResponseWithButtonDelete_textResponse {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock" | "VideoBlockContent";
  id: string;
  parentOrder: number | null;
}

export interface TextResponseWithButtonDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  endIcon: TextResponseWithButtonDelete_endIcon[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  startIcon: TextResponseWithButtonDelete_startIcon[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  button: TextResponseWithButtonDelete_button[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  textResponse: TextResponseWithButtonDelete_textResponse[];
}

export interface TextResponseWithButtonDeleteVariables {
  textResponseId: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
}
