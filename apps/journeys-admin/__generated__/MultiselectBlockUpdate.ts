/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectBlockUpdate
// ====================================================

export interface MultiselectBlockUpdate_multiselectBlockUpdate {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  min: number | null;
  max: number | null;
}

export interface MultiselectBlockUpdate {
  multiselectBlockUpdate: MultiselectBlockUpdate_multiselectBlockUpdate;
}

export interface MultiselectBlockUpdateVariables {
  id: string;
  input: MultiselectBlockUpdateInput;
}
