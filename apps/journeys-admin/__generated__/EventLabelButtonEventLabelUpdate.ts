/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EventLabelButtonEventLabelUpdate
// ====================================================

export interface EventLabelButtonEventLabelUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
}

export interface EventLabelButtonEventLabelUpdate {
  buttonBlockUpdate: EventLabelButtonEventLabelUpdate_buttonBlockUpdate | null;
}

export interface EventLabelButtonEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
