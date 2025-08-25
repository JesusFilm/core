/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatButtonCreateInput, MessagePlatform } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyChatButtonCreate
// ====================================================

export interface JourneyChatButtonCreate_chatButtonCreate {
  __typename: "ChatButton";
  id: string | null;
  link: string | null;
  platform: MessagePlatform | null;
}

export interface JourneyChatButtonCreate {
  chatButtonCreate: JourneyChatButtonCreate_chatButtonCreate | null;
}

export interface JourneyChatButtonCreateVariables {
  journeyId: string;
  input?: ChatButtonCreateInput | null;
}
