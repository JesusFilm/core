/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IdType, ChatPlatform } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyChatButtons
// ====================================================

export interface GetJourneyChatButtons_journey_chatButtons {
  __typename: "ChatButton";
  id: string;
  link: string | null;
  platform: ChatPlatform | null;
}

export interface GetJourneyChatButtons_journey {
  __typename: "Journey";
  chatButtons: GetJourneyChatButtons_journey_chatButtons[];
}

export interface GetJourneyChatButtons {
  journey: GetJourneyChatButtons_journey | null;
}

export interface GetJourneyChatButtonsVariables {
  id: string;
  idType?: IdType | null;
}
