/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoSiblings
// ====================================================

export interface GetVideoSiblings_episodes_snippet {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideoSiblings_episodes_title {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideoSiblings_episodes_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideoSiblings_episodes_permalinks {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideoSiblings_episodes {
  __typename: "Video";
  id: string;
  type: VideoType;
  image: string | null;
  snippet: GetVideoSiblings_episodes_snippet[];
  title: GetVideoSiblings_episodes_title[];
  variant: GetVideoSiblings_episodes_variant | null;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  episodeIds: string[];
  permalinks: GetVideoSiblings_episodes_permalinks[];
}

export interface GetVideoSiblings {
  episodes: GetVideoSiblings_episodes[];
}

export interface GetVideoSiblingsVariables {
  playlistId: string;
}
