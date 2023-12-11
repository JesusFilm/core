/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChannelStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Channels
// ====================================================

export interface Channels_channels_youtube {
  __typename: "ChannelYoutube";
  title: string | null;
  youtubeId: string | null;
  channelId: string | null;
  imageUrl: string | null;
}

export interface Channels_channels {
  __typename: "Channel";
  id: string;
  name: string;
  platform: string | null;
  connected: boolean | null;
  status: ChannelStatus;
  youtube: Channels_channels_youtube | null;
}

export interface Channels {
  channels: Channels_channels[] | null;
}
