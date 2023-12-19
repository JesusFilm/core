/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConnectYoutubeChannelInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ConnectChannel
// ====================================================

export interface ConnectChannel_connectYoutubeChannel {
  __typename: "Channel";
  id: string;
  platform: string | null;
  connected: boolean | null;
}

export interface ConnectChannel {
  connectYoutubeChannel: ConnectChannel_connectYoutubeChannel;
}

export interface ConnectChannelVariables {
  input: ConnectYoutubeChannelInput;
}
