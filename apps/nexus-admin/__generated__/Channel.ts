/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Channel
// ====================================================

export interface Channel_channel {
  __typename: "Channel";
  id: string;
  name: string;
  platform: string | null;
}

export interface Channel {
  channel: Channel_channel;
}

export interface ChannelVariables {
  channelID: string;
}
