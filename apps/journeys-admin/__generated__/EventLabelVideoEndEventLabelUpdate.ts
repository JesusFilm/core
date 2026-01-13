/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BlockEventLabel } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EventLabelVideoEndEventLabelUpdate
// ====================================================

export interface EventLabelVideoEndEventLabelUpdate_videoBlockUpdate {
  __typename: "VideoBlock";
  id: string;
  eventLabel: BlockEventLabel | null;
  endEventLabel: BlockEventLabel | null;
}

export interface EventLabelVideoEndEventLabelUpdate {
  videoBlockUpdate: EventLabelVideoEndEventLabelUpdate_videoBlockUpdate;
}

export interface EventLabelVideoEndEventLabelUpdateVariables {
  id: string;
  endEventLabel?: BlockEventLabel | null;
}
