/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockCardCreateMutation
// ====================================================

export interface AiBlockCardCreateMutation_cardBlockCreate {
  __typename: "CardBlock";
  id: string;
}

export interface AiBlockCardCreateMutation {
  cardBlockCreate: AiBlockCardCreateMutation_cardBlockCreate;
}

export interface AiBlockCardCreateMutationVariables {
  input: CardBlockCreateInput;
}
