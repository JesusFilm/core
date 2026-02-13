/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EventLabelCardEventLabelUpdate
// ====================================================

export interface EventLabelCardEventLabelUpdate_cardBlockUpdate {
  __typename: "CardBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
}

export interface EventLabelCardEventLabelUpdate {
  cardBlockUpdate: EventLabelCardEventLabelUpdate_cardBlockUpdate;
}

export interface EventLabelCardEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
