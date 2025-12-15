/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectBlockCreateInput, MultiselectOptionBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectBlockCreate
// ====================================================

export interface MultiselectBlockCreate_multiselectBlockCreate {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  min: number | null;
  max: number | null;
}

export interface MultiselectBlockCreate_multiselectOption1 {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface MultiselectBlockCreate_multiselectOption2 {
  __typename: "MultiselectOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
}

export interface MultiselectBlockCreate {
  multiselectBlockCreate: MultiselectBlockCreate_multiselectBlockCreate;
  multiselectOption1: MultiselectBlockCreate_multiselectOption1;
  multiselectOption2: MultiselectBlockCreate_multiselectOption2;
}

export interface MultiselectBlockCreateVariables {
  input: MultiselectBlockCreateInput;
  multiselectOptionBlockCreateInput1: MultiselectOptionBlockCreateInput;
  multiselectOptionBlockCreateInput2: MultiselectOptionBlockCreateInput;
}
