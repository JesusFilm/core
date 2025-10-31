/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: MultiselectWithButtonRestore
// ====================================================

export interface MultiselectWithButtonRestore_multiselect {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MultiselectWithButtonRestore_option1 {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MultiselectWithButtonRestore_option2 {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MultiselectWithButtonRestore_button {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MultiselectWithButtonRestore_startIcon {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MultiselectWithButtonRestore_endIcon {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "MultiselectBlock" | "MultiselectOptionBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface MultiselectWithButtonRestore {
  /**
   * blockRestore is used for redo/undo
   */
  multiselect: MultiselectWithButtonRestore_multiselect[];
  /**
   * blockRestore is used for redo/undo
   */
  option1: MultiselectWithButtonRestore_option1[];
  /**
   * blockRestore is used for redo/undo
   */
  option2: MultiselectWithButtonRestore_option2[];
  /**
   * blockRestore is used for redo/undo
   */
  button: MultiselectWithButtonRestore_button[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon: MultiselectWithButtonRestore_startIcon[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon: MultiselectWithButtonRestore_endIcon[];
}

export interface MultiselectWithButtonRestoreVariables {
  multiselectId: string;
  option1Id: string;
  option2Id: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
}
