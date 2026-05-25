/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockChatAssistantUpdate
// ====================================================

export interface CardBlockChatAssistantUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  /**
   * When true, this card displays the AI chat button.
   */
  showAssistant: boolean | null;
  /**
   * When true, the chat drawer auto-opens on first visit to this card.
   */
  expandChatByDefault: boolean | null;
}

export interface CardBlockChatAssistantUpdate {
  cardBlockUpdate: CardBlockChatAssistantUpdate_cardBlockUpdate;
}

export interface CardBlockChatAssistantUpdateVariables {
  id: string;
  input: CardBlockUpdateInput;
}
