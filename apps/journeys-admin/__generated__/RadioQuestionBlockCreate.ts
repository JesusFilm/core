/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioQuestionBlockCreateInput, RadioOptionBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RadioQuestionBlockCreate
// ====================================================

export interface RadioQuestionBlockCreate_radioQuestionBlockCreate {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
}

export interface RadioQuestionBlockCreate_radioOption1_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface RadioQuestionBlockCreate_radioOption1_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface RadioQuestionBlockCreate_radioOption1_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface RadioQuestionBlockCreate_radioOption1_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: RadioQuestionBlockCreate_radioOption1_action_NavigateToJourneyAction_journey_language;
}

export interface RadioQuestionBlockCreate_radioOption1_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: RadioQuestionBlockCreate_radioOption1_action_NavigateToJourneyAction_journey | null;
}

export interface RadioQuestionBlockCreate_radioOption1_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface RadioQuestionBlockCreate_radioOption1_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type RadioQuestionBlockCreate_radioOption1_action = RadioQuestionBlockCreate_radioOption1_action_NavigateAction | RadioQuestionBlockCreate_radioOption1_action_NavigateToBlockAction | RadioQuestionBlockCreate_radioOption1_action_NavigateToJourneyAction | RadioQuestionBlockCreate_radioOption1_action_LinkAction | RadioQuestionBlockCreate_radioOption1_action_EmailAction;

export interface RadioQuestionBlockCreate_radioOption1 {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: RadioQuestionBlockCreate_radioOption1_action | null;
}

export interface RadioQuestionBlockCreate_radioOption2_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface RadioQuestionBlockCreate_radioOption2_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface RadioQuestionBlockCreate_radioOption2_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface RadioQuestionBlockCreate_radioOption2_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: RadioQuestionBlockCreate_radioOption2_action_NavigateToJourneyAction_journey_language;
}

export interface RadioQuestionBlockCreate_radioOption2_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: RadioQuestionBlockCreate_radioOption2_action_NavigateToJourneyAction_journey | null;
}

export interface RadioQuestionBlockCreate_radioOption2_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface RadioQuestionBlockCreate_radioOption2_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type RadioQuestionBlockCreate_radioOption2_action = RadioQuestionBlockCreate_radioOption2_action_NavigateAction | RadioQuestionBlockCreate_radioOption2_action_NavigateToBlockAction | RadioQuestionBlockCreate_radioOption2_action_NavigateToJourneyAction | RadioQuestionBlockCreate_radioOption2_action_LinkAction | RadioQuestionBlockCreate_radioOption2_action_EmailAction;

export interface RadioQuestionBlockCreate_radioOption2 {
  __typename: "RadioOptionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  action: RadioQuestionBlockCreate_radioOption2_action | null;
}

export interface RadioQuestionBlockCreate {
  radioQuestionBlockCreate: RadioQuestionBlockCreate_radioQuestionBlockCreate;
  radioOption1: RadioQuestionBlockCreate_radioOption1;
  radioOption2: RadioQuestionBlockCreate_radioOption2;
}

export interface RadioQuestionBlockCreateVariables {
  input: RadioQuestionBlockCreateInput;
  radioOptionBlockCreateInput1: RadioOptionBlockCreateInput;
  radioOptionBlockCreateInput2: RadioOptionBlockCreateInput;
}
