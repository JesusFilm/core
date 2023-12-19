/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChannelUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ChannelUpdate
// ====================================================

export interface ChannelUpdate_channelUpdate {
  __typename: "Channel";
  id: string;
  name: string;
  platform: string | null;
}

export interface ChannelUpdate {
  channelUpdate: ChannelUpdate_channelUpdate;
}

export interface ChannelUpdateVariables {
  channelId: string;
  input: ChannelUpdateInput;
}
