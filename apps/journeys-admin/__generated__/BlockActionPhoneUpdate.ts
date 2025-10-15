/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PhoneActionInput, ContactActionType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockActionPhoneUpdate
// ====================================================

export interface BlockActionPhoneUpdate_blockUpdatePhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
  contactAction: ContactActionType;
}

export interface BlockActionPhoneUpdate {
  blockUpdatePhoneAction: BlockActionPhoneUpdate_blockUpdatePhoneAction;
}

export interface BlockActionPhoneUpdateVariables {
  id: string;
  input: PhoneActionInput;
}
