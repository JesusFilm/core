/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockActionChatUpdate
// ====================================================

export interface BlockActionChatUpdate_blockUpdateChatAction {
  __typename: "ChatAction";
  parentBlockId: string;
  gtmEventName: string | null;
  chatUrl: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface BlockActionChatUpdate {
  blockUpdateChatAction: BlockActionChatUpdate_blockUpdateChatAction;
}

export interface BlockActionChatUpdateVariables {
  id: string;
  input: ChatActionInput;
}
