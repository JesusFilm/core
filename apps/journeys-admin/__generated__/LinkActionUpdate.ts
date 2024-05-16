/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: LinkActionUpdate
// ====================================================

export interface LinkActionUpdate_blockUpdateLinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface LinkActionUpdate {
  blockUpdateLinkAction: LinkActionUpdate_blockUpdateLinkAction;
}

export interface LinkActionUpdateVariables {
  id: string;
  journeyId: string;
  input: LinkActionInput;
}
