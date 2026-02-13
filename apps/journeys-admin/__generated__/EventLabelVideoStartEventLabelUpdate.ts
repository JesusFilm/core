/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EventLabelVideoStartEventLabelUpdate
// ====================================================

export interface EventLabelVideoStartEventLabelUpdate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
  endEventLabel: BlockEventLabel | null;
}

export interface EventLabelVideoStartEventLabelUpdate {
  videoBlockUpdate: EventLabelVideoStartEventLabelUpdate_videoBlockUpdate;
}

export interface EventLabelVideoStartEventLabelUpdateVariables {
  id: string;
  eventLabel?: BlockEventLabel | null;
}
