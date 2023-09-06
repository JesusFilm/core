/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockCreateInput, IconBlockCreateInput, TextResponseBlockUpdateInput, IconName, IconSize, IconColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseBlockCreate
// ====================================================

export interface TextResponseBlockCreate_textResponseBlockCreate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToJourneyAction_journey_language;
}

export interface TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToJourneyAction_journey | null;
}

export interface TextResponseBlockCreate_textResponseBlockCreate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface TextResponseBlockCreate_textResponseBlockCreate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type TextResponseBlockCreate_textResponseBlockCreate_action = TextResponseBlockCreate_textResponseBlockCreate_action_NavigateAction | TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToBlockAction | TextResponseBlockCreate_textResponseBlockCreate_action_NavigateToJourneyAction | TextResponseBlockCreate_textResponseBlockCreate_action_LinkAction | TextResponseBlockCreate_textResponseBlockCreate_action_EmailAction;

export interface TextResponseBlockCreate_textResponseBlockCreate {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: TextResponseBlockCreate_textResponseBlockCreate_action | null;
}

export interface TextResponseBlockCreate_submitIcon {
  __typename: "IconBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  iconName: IconName | null;
  iconSize: IconSize | null;
  iconColor: IconColor | null;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateAction {
  __typename: "NavigateAction";
  parentBlockId: string;
  gtmEventName: string | null;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  parentBlockId: string;
  gtmEventName: string | null;
  blockId: string;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey_language {
  __typename: "Language";
  bcp47: string | null;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  language: TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey_language;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  parentBlockId: string;
  gtmEventName: string | null;
  journey: TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToJourneyAction_journey | null;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate_action_LinkAction {
  __typename: "LinkAction";
  parentBlockId: string;
  gtmEventName: string | null;
  url: string;
}

export interface TextResponseBlockCreate_textResponseBlockUpdate_action_EmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export type TextResponseBlockCreate_textResponseBlockUpdate_action = TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateAction | TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToBlockAction | TextResponseBlockCreate_textResponseBlockUpdate_action_NavigateToJourneyAction | TextResponseBlockCreate_textResponseBlockUpdate_action_LinkAction | TextResponseBlockCreate_textResponseBlockUpdate_action_EmailAction;

export interface TextResponseBlockCreate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
  submitLabel: string | null;
  submitIconId: string | null;
  action: TextResponseBlockCreate_textResponseBlockUpdate_action | null;
}

export interface TextResponseBlockCreate {
  textResponseBlockCreate: TextResponseBlockCreate_textResponseBlockCreate;
  submitIcon: TextResponseBlockCreate_submitIcon;
  textResponseBlockUpdate: TextResponseBlockCreate_textResponseBlockUpdate | null;
}

export interface TextResponseBlockCreateVariables {
  input: TextResponseBlockCreateInput;
  iconBlockCreateInput: IconBlockCreateInput;
  id: string;
  journeyId: string;
  updateInput: TextResponseBlockUpdateInput;
}
