/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatButtonCreateInput, ChatPlatform } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyChatButtonCreate
// ====================================================

export interface JourneyChatButtonCreate_chatButtonCreate {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: ChatPlatform | null;
}

export interface JourneyChatButtonCreate {
  chatButtonCreate: JourneyChatButtonCreate_chatButtonCreate;
}

export interface JourneyChatButtonCreateVariables {
  journeyId: string;
  input?: ChatButtonCreateInput | null;
}
