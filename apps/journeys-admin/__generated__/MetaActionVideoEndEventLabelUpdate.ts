/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MetaActionVideoEndEventLabelUpdate
// ====================================================

export interface MetaActionVideoEndEventLabelUpdate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
  endEventLabel: BlockEventLabel | null;
}

export interface MetaActionVideoEndEventLabelUpdate {
  videoBlockUpdate: MetaActionVideoEndEventLabelUpdate_videoBlockUpdate;
}

export interface MetaActionVideoEndEventLabelUpdateVariables {
  id: string;
  endEventLabel?: BlockEventLabel | null;
}
