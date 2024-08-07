/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IconBlockColorUpdate
// ====================================================

export interface IconBlockColorUpdate_iconBlockUpdate {
  __typename: "IconBlock";
  id: string;
  color: IconColor | null;
}

export interface IconBlockColorUpdate {
  iconBlockUpdate: IconBlockColorUpdate_iconBlockUpdate;
}

export interface IconBlockColorUpdateVariables {
  id: string;
  color: IconColor;
}
