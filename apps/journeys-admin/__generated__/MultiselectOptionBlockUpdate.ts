/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectOptionBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectOptionBlockUpdate
// ====================================================

export interface MultiselectOptionBlockUpdate_multiselectOptionBlockUpdate {
  __typename: "MultiselectOptionBlock";
  id: string;
  label: string;
}

export interface MultiselectOptionBlockUpdate {
  multiselectOptionBlockUpdate: MultiselectOptionBlockUpdate_multiselectOptionBlockUpdate;
}

export interface MultiselectOptionBlockUpdateVariables {
  id: string;
  input: MultiselectOptionBlockUpdateInput;
}
