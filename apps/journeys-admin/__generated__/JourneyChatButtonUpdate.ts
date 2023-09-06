/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatButtonUpdateInput, ChatPlatform } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyChatButtonUpdate
// ====================================================

export interface JourneyChatButtonUpdate_chatButtonUpdate {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: ChatPlatform | null;
}

export interface JourneyChatButtonUpdate {
  chatButtonUpdate: JourneyChatButtonUpdate_chatButtonUpdate;
}

export interface JourneyChatButtonUpdateVariables {
  chatButtonUpdateId: string;
  journeyId: string;
  input: ChatButtonUpdateInput;
}
