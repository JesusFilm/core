/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { FormBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: FormBlockCreate
// ====================================================

export interface FormBlockCreate_formBlockCreate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface FormBlockCreate_formBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface FormBlockCreate_formBlockCreate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface FormBlockCreate_formBlockCreate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: FormBlockCreate_formBlockCreate_action_NavigateToJourneyAction_journey_language;
}

export interface FormBlockCreate_formBlockCreate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: FormBlockCreate_formBlockCreate_action_NavigateToJourneyAction_journey | null;
}

export interface FormBlockCreate_formBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface FormBlockCreate_formBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type FormBlockCreate_formBlockCreate_action = FormBlockCreate_formBlockCreate_action_NavigateAction | FormBlockCreate_formBlockCreate_action_NavigateToBlockAction | FormBlockCreate_formBlockCreate_action_NavigateToJourneyAction | FormBlockCreate_formBlockCreate_action_LinkAction | FormBlockCreate_formBlockCreate_action_EmailAction;

export interface FormBlockCreate_formBlockCreate {
  __typename: "FormBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  form: any | null;
  action: FormBlockCreate_formBlockCreate_action | null;
}

export interface FormBlockCreate {
  formBlockCreate: FormBlockCreate_formBlockCreate;
}

export interface FormBlockCreateVariables {
  input: FormBlockCreateInput;
}
