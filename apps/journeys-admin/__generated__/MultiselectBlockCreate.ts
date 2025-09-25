/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectBlockCreateInput, MultiselectOptionBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectBlockCreate
// ====================================================

export interface MultiselectBlockCreate_multiselectBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
  target: string | null;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface MultiselectBlockCreate_multiselectBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface MultiselectBlockCreate_multiselectBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface MultiselectBlockCreate_multiselectBlockCreate_action_PhoneAction {
  __typename: "PhoneAction";
  parentBlockId: string;
  gtmEventName: string | null;
  phone: string;
  countryCode: string;
}

export type MultiselectBlockCreate_multiselectBlockCreate_action = MultiselectBlockCreate_multiselectBlockCreate_action_LinkAction | MultiselectBlockCreate_multiselectBlockCreate_action_NavigateToBlockAction | MultiselectBlockCreate_multiselectBlockCreate_action_EmailAction | MultiselectBlockCreate_multiselectBlockCreate_action_PhoneAction;

export interface MultiselectBlockCreate_multiselectBlockCreate {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  min: number | null;
  max: number | null;
  action: MultiselectBlockCreate_multiselectBlockCreate_action | null;
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
