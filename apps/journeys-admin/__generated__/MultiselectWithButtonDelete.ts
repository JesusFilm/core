/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: MultiselectWithButtonDelete
// ====================================================

export interface MultiselectWithButtonDelete_endIcon {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface MultiselectWithButtonDelete_startIcon {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface MultiselectWithButtonDelete_button {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface MultiselectWithButtonDelete_option2 {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface MultiselectWithButtonDelete_option1 {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface MultiselectWithButtonDelete_multiselect {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentOrder: number | null;
}

export interface MultiselectWithButtonDelete {
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  endIcon: MultiselectWithButtonDelete_endIcon[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  startIcon: MultiselectWithButtonDelete_startIcon[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  button: MultiselectWithButtonDelete_button[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  option2: MultiselectWithButtonDelete_option2[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  option1: MultiselectWithButtonDelete_option1[];
  /**
   * blockDelete returns the updated sibling blocks on successful delete
   */
  multiselect: MultiselectWithButtonDelete_multiselect[];
}

export interface MultiselectWithButtonDeleteVariables {
  multiselectId: string;
  option1Id: string;
  option2Id: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
}
