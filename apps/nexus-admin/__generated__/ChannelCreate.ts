/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ChannelCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ChannelCreate
// ====================================================

export interface ChannelCreate_channelCreate {
  __typename: "Channel";
  id: string;
  name: string;
  platform: string | null;
}

export interface ChannelCreate {
  channelCreate: ChannelCreate_channelCreate;
}

export interface ChannelCreateVariables {
  input: ChannelCreateInput;
}
