/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EventLabelRadioOptionEventLabelUpdate
// ====================================================

export interface EventLabelRadioOptionEventLabelUpdate_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
}

export interface EventLabelRadioOptionEventLabelUpdate {
  radioOptionBlockUpdate: EventLabelRadioOptionEventLabelUpdate_radioOptionBlockUpdate;
}

export interface EventLabelRadioOptionEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
