/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChannelFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: Channels
// ====================================================

export interface Channels_channels {
  __typename: "Channel";
  id: string;
  name: string;
  platform: string | null;
  connected: boolean | null;
  title: string | null;
  youtubeId: string | null;
  imageUrl: string | null;
}

export interface Channels {
  channels: Channels_channels[] | null;
}

export interface ChannelsVariables {
  where?: ChannelFilter | null;
}
