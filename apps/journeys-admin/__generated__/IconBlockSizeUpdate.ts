/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IconBlockUpdateInput, IconSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IconBlockSizeUpdate
// ====================================================

export interface IconBlockSizeUpdate_iconBlockUpdate {
  __typename: "IconBlock";
  id: string;
  size: IconSize | null;
}

export interface IconBlockSizeUpdate {
  iconBlockUpdate: IconBlockSizeUpdate_iconBlockUpdate;
}

export interface IconBlockSizeUpdateVariables {
  id: string;
  journeyId: string;
  input: IconBlockUpdateInput;
}
