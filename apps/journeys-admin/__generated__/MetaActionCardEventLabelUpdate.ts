/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MetaActionCardEventLabelUpdate
// ====================================================

export interface MetaActionCardEventLabelUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
}

export interface MetaActionCardEventLabelUpdate {
  cardBlockUpdate: MetaActionCardEventLabelUpdate_cardBlockUpdate;
}

export interface MetaActionCardEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
