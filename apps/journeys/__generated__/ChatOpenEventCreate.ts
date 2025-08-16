/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatOpenEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ChatOpenEventCreate
// ====================================================

export interface ChatOpenEventCreate_chatOpenEventCreate {
  __typename: "ChatOpenEvent";
  id: string | null;
}

export interface ChatOpenEventCreate {
  chatOpenEventCreate: ChatOpenEventCreate_chatOpenEventCreate;
}

export interface ChatOpenEventCreateVariables {
  input: ChatOpenEventCreateInput;
}
