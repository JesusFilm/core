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
  value: string;
}

export interface GetVideoSiblings_episodes_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoSiblings_episodes_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideoSiblings_episodes_slug {
  __typename: "Translation";
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
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideoSiblings_episodes_slug[];
}

export interface GetVideoSiblings {
  episodes: GetVideoSiblings_episodes[];
}

export interface GetVideoSiblingsVariables {
  playlistId: string;
  languageId?: string | null;
}
