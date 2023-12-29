/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ChannelDelete
// ====================================================

export interface ChannelDelete_channelDelete {
    __typename: "Channel";
    id: string;
    name: string;
    platform: string | null;
  }
  
  export interface ChannelDelete {
    channelDelete: ChannelDelete_channelDelete;
  }
  
  export interface ChannelDeleteVariables {
    channelId: string;
  }
  