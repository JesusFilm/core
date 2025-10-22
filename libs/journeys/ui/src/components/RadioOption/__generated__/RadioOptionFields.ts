/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ContactActionType } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: RadioOptionFields
// ====================================================

export interface RadioOptionFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  blockId: string;
}

export interface RadioOptionFields_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface RadioOptionFields_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface RadioOptionFields_action_ChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface RadioOptionFields_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
}

export type RadioOptionFields_action = RadioOptionFields_action_NavigateToBlockAction | RadioOptionFields_action_LinkAction | RadioOptionFields_action_EmailAction | RadioOptionFields_action_ChatAction | RadioOptionFields_action_PhoneAction;

export interface RadioOptionFields {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: RadioOptionFields_action | null;
  /**
   * pollOptionImageBlockId is present if a child block should be used as a poll option image.
   *       This child block should not be rendered normally, instead it should be used
   *       as a poll option image. Blocks are often of type ImageBlock
   */
  pollOptionImageBlockId: string | null;
}
