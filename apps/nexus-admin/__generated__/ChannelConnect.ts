/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ConnectYoutubeChannelInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ChannelConnect
// ====================================================

export interface ChannelConnect_channelConnect {
  __typename: "Channel";
  id: string;
}

export interface ChannelConnect {
  channelConnect: ChannelConnect_channelConnect;
}

export interface ChannelConnectVariables {
  input: ConnectYoutubeChannelInput;
}
