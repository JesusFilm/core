/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChatPlatform } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyChatButtonRemove
// ====================================================

export interface JourneyChatButtonRemove_chatButtonRemove {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: ChatPlatform | null;
}

export interface JourneyChatButtonRemove {
  chatButtonRemove: JourneyChatButtonRemove_chatButtonRemove;
}

export interface JourneyChatButtonRemoveVariables {
  id: string;
}
