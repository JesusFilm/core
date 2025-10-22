/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatOpenEventCreateInput } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: ChatButtonEventCreate
// ====================================================

export interface ChatButtonEventCreate_chatOpenEventCreate {
  __typename: "ChatOpenEvent";
  id: string;
}

export interface ChatButtonEventCreate {
  chatOpenEventCreate: ChatButtonEventCreate_chatOpenEventCreate;
}

export interface ChatButtonEventCreateVariables {
  input: ChatOpenEventCreateInput;
}
