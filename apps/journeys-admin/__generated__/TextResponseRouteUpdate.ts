/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseRouteUpdate
// ====================================================

export interface TextResponseRouteUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  routeId: string | null;
}

export interface TextResponseRouteUpdate {
  textResponseBlockUpdate: TextResponseRouteUpdate_textResponseBlockUpdate;
}

export interface TextResponseRouteUpdateVariables {
  id: string;
  input: TextResponseBlockUpdateInput;
}
