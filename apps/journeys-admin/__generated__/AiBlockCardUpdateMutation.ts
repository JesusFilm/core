/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockCardUpdateMutation
// ====================================================

export interface AiBlockCardUpdateMutation_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
}

export interface AiBlockCardUpdateMutation {
  cardBlockUpdate: AiBlockCardUpdateMutation_cardBlockUpdate;
}

export interface AiBlockCardUpdateMutationVariables {
  id: string;
  input: CardBlockUpdateInput;
}
