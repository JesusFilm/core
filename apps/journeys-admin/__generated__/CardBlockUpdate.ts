/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CardBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CardBlockUpdate
// ====================================================

export interface CardBlockUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
}

export interface CardBlockUpdate {
  cardBlockUpdate: CardBlockUpdate_cardBlockUpdate;
}

export interface CardBlockUpdateVariables {
  id: string;
  input: CardBlockUpdateInput;
}
