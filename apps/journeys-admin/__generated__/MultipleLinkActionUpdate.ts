/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultipleLinkActionUpdate
// ====================================================

export interface MultipleLinkActionUpdate_blockUpdateLinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export interface MultipleLinkActionUpdate {
  blockUpdateLinkAction: MultipleLinkActionUpdate_blockUpdateLinkAction;
}

export interface MultipleLinkActionUpdateVariables {
  id: string;
  journeyId: string;
  input: LinkActionInput;
}
