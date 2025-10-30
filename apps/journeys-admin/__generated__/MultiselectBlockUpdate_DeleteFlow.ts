/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectBlockUpdate_DeleteFlow
// ====================================================

export interface MultiselectBlockUpdate_DeleteFlow_multiselectBlockUpdate {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  min: number | null;
  max: number | null;
}

export interface MultiselectBlockUpdate_DeleteFlow {
  multiselectBlockUpdate: MultiselectBlockUpdate_DeleteFlow_multiselectBlockUpdate;
}

export interface MultiselectBlockUpdate_DeleteFlowVariables {
  id: string;
  input: MultiselectBlockUpdateInput;
}
