/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectBlockUpdate_Spec
// ====================================================

export interface MultiselectBlockUpdate_Spec_multiselectBlockUpdate {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  min: number | null;
  max: number | null;
}

export interface MultiselectBlockUpdate_Spec {
  multiselectBlockUpdate: MultiselectBlockUpdate_Spec_multiselectBlockUpdate;
}

export interface MultiselectBlockUpdate_SpecVariables {
  id: string;
  input: MultiselectBlockUpdateInput;
}
