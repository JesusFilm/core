/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MetaActionRadioOptionEventLabelUpdate
// ====================================================

export interface MetaActionRadioOptionEventLabelUpdate_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
}

export interface MetaActionRadioOptionEventLabelUpdate {
  radioOptionBlockUpdate: MetaActionRadioOptionEventLabelUpdate_radioOptionBlockUpdate;
}

export interface MetaActionRadioOptionEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
