/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BatchFilter, BatchStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Batches
// ====================================================

export interface Batches_batches_channel_youtube {
  __typename: "ChannelYoutube";
  imageUrl: string | null;
  title: string | null;
}

export interface Batches_batches_channel {
  __typename: "Channel";
  name: string;
  platform: string | null;
  youtube: Batches_batches_channel_youtube | null;
}

export interface Batches_batches {
  __typename: "Batch";
  id: string;
  name: string;
  status: BatchStatus;
  channel: Batches_batches_channel | null;
}

export interface Batches {
  batches: Batches_batches[] | null;
}

export interface BatchesVariables {
  where?: BatchFilter | null;
}
