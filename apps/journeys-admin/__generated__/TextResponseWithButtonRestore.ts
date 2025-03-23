/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseType, ButtonVariant, ButtonColor, ButtonSize, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseWithButtonRestore
// ====================================================

export interface TextResponseWithButtonRestore_textResponse_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface TextResponseWithButtonRestore_textResponse_TextResponseBlock {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
}

export type TextResponseWithButtonRestore_textResponse = TextResponseWithButtonRestore_textResponse_ImageBlock | TextResponseWithButtonRestore_textResponse_TextResponseBlock;

export interface TextResponseWithButtonRestore_button_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "CardBlock" | "IconBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface TextResponseWithButtonRestore_button_ButtonBlock_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseWithButtonRestore_button_ButtonBlock_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface TextResponseWithButtonRestore_button_ButtonBlock_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type TextResponseWithButtonRestore_button_ButtonBlock_action = TextResponseWithButtonRestore_button_ButtonBlock_action_NavigateToBlockAction | TextResponseWithButtonRestore_button_ButtonBlock_action_LinkAction | TextResponseWithButtonRestore_button_ButtonBlock_action_EmailAction;

export interface TextResponseWithButtonRestore_button_ButtonBlock {
  __typename: "ButtonBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  buttonVariant: ButtonVariant | null;
  buttonColor: ButtonColor | null;
  size: ButtonSize | null;
  startIconId: string | null;
  endIconId: string | null;
  action: TextResponseWithButtonRestore_button_ButtonBlock_action | null;
  submitEnabled: boolean | null;
}

export type TextResponseWithButtonRestore_button = TextResponseWithButtonRestore_button_ImageBlock | TextResponseWithButtonRestore_button_ButtonBlock;

export interface TextResponseWithButtonRestore_startIcon_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface TextResponseWithButtonRestore_startIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export type TextResponseWithButtonRestore_startIcon = TextResponseWithButtonRestore_startIcon_ImageBlock | TextResponseWithButtonRestore_startIcon_IconBlock;

export interface TextResponseWithButtonRestore_endIcon_ImageBlock {
  __typename: "ImageBlock" | "StepBlock" | "ButtonBlock" | "CardBlock" | "RadioOptionBlock" | "RadioQuestionBlock" | "SignUpBlock" | "SpacerBlock" | "TextResponseBlock" | "TypographyBlock" | "VideoBlock" | "GridContainerBlock" | "GridItemBlock" | "VideoTriggerBlock";
}

export interface TextResponseWithButtonRestore_endIcon_IconBlock {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export type TextResponseWithButtonRestore_endIcon = TextResponseWithButtonRestore_endIcon_ImageBlock | TextResponseWithButtonRestore_endIcon_IconBlock;

export interface TextResponseWithButtonRestore {
  /**
   * blockRestore is used for redo/undo
   */
  textResponse: TextResponseWithButtonRestore_textResponse[];
  /**
   * blockRestore is used for redo/undo
   */
  button: TextResponseWithButtonRestore_button[];
  /**
   * blockRestore is used for redo/undo
   */
  startIcon: TextResponseWithButtonRestore_startIcon[];
  /**
   * blockRestore is used for redo/undo
   */
  endIcon: TextResponseWithButtonRestore_endIcon[];
}

export interface TextResponseWithButtonRestoreVariables {
  textResponseId: string;
  buttonId: string;
  startIconId: string;
  endIconId: string;
}
