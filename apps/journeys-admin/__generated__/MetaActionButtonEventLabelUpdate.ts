/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MetaActionButtonEventLabelUpdate
// ====================================================

export interface MetaActionButtonEventLabelUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
}

export interface MetaActionButtonEventLabelUpdate {
  buttonBlockUpdate: MetaActionButtonEventLabelUpdate_buttonBlockUpdate | null;
}

export interface MetaActionButtonEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
