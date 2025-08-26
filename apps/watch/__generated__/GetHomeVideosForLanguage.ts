/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetHomeVideosForLanguage
// ====================================================

export interface GetHomeVideosForLanguage_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetHomeVideosForLanguage_videos_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetHomeVideosForLanguage_videos_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetHomeVideosForLanguage_videos_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetHomeVideosForLanguage_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetHomeVideosForLanguage_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetHomeVideosForLanguage_videos_title[];
  images: GetHomeVideosForLanguage_videos_images[];
  imageAlt: GetHomeVideosForLanguage_videos_imageAlt[];
  snippet: GetHomeVideosForLanguage_videos_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  variant: GetHomeVideosForLanguage_videos_variant | null;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
}

export interface GetHomeVideosForLanguage {
  videos: GetHomeVideosForLanguage_videos[];
}

export interface GetHomeVideosForLanguageVariables {
  ids: string[];
  languageId?: string | null;
}
