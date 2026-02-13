/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconName } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IconBlockNameUpdate
// ====================================================

export interface IconBlockNameUpdate_iconBlockUpdate {
  __typename: "IconBlock";
  id: string;
  name: IconName | null;
}

export interface IconBlockNameUpdate {
  iconBlockUpdate: IconBlockNameUpdate_iconBlockUpdate;
}

export interface IconBlockNameUpdateVariables {
  id: string;
  name?: IconName | null;
}
