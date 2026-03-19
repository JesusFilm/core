/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyAiChatInput } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: JourneyAiChatCreateSubscription
// ====================================================

export interface JourneyAiChatCreateSubscription_journeyAiChatCreateSubscription {
  __typename: "JourneyAiChatMessage";
  type: string | null;
  text: string | null;
  operations: string | null;
  operationId: string | null;
  status: string | null;
  turnId: string | null;
  journeyUpdated: boolean | null;
  requiresConfirmation: boolean | null;
  name: string | null;
  args: string | null;
  summary: string | null;
  cardId: string | null;
  error: string | null;
  validation: string | null;
}

export interface JourneyAiChatCreateSubscription {
  journeyAiChatCreateSubscription: JourneyAiChatCreateSubscription_journeyAiChatCreateSubscription;
}

export interface JourneyAiChatCreateSubscriptionVariables {
  input: JourneyAiChatInput;
}
