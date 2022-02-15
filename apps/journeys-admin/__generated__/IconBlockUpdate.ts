/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconBlockUpdateInput, IconName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IconBlockUpdate
// ====================================================

export interface IconBlockUpdate_iconBlockUpdate {
  __typename: "IconBlock";
  id: string;
  name: IconName;
}

export interface IconBlockUpdate {
  iconBlockUpdate: IconBlockUpdate_iconBlockUpdate;
}

export interface IconBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: IconBlockUpdateInput;
}
