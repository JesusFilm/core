/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MetaActionVideoStartEventLabelUpdate
// ====================================================

export interface MetaActionVideoStartEventLabelUpdate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
  endEventLabel: BlockEventLabel | null;
}

export interface MetaActionVideoStartEventLabelUpdate {
  videoBlockUpdate: MetaActionVideoStartEventLabelUpdate_videoBlockUpdate;
}

export interface MetaActionVideoStartEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
