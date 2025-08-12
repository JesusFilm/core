/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockActionLinkUpdate
// ====================================================

export interface BlockActionLinkUpdate_blockUpdateLinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface BlockActionLinkUpdate {
  blockUpdateLinkAction: BlockActionLinkUpdate_blockUpdateLinkAction;
}

export interface BlockActionLinkUpdateVariables {
  id: string;
  input: LinkActionInput;
}
