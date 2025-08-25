/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatButtonUpdateInput, MessagePlatform } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyChatButtonUpdate
// ====================================================

export interface JourneyChatButtonUpdate_chatButtonUpdate {
  __typename: "ChatButton";
  id: string | null;
  link: string | null;
  platform: MessagePlatform | null;
}

export interface JourneyChatButtonUpdate {
  chatButtonUpdate: JourneyChatButtonUpdate_chatButtonUpdate | null;
}

export interface JourneyChatButtonUpdateVariables {
  chatButtonUpdateId: string;
  journeyId: string;
  input: ChatButtonUpdateInput;
}
