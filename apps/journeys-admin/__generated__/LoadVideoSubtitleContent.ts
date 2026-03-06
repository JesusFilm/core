/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadVideoSubtitleContent
// ====================================================

export interface LoadVideoSubtitleContent_video_variant_subtitle {
  __typename: "VideoSubtitle";
  id: string;
  languageId: string;
  edition: string;
  primary: boolean;
  srtSrc: string | null;
}

export interface LoadVideoSubtitleContent_video_variant {
  __typename: "VideoVariant";
  id: string;
  subtitle: LoadVideoSubtitleContent_video_variant_subtitle[];
}

export interface LoadVideoSubtitleContent_video {
  __typename: "Video";
  id: string;
  variant: LoadVideoSubtitleContent_video_variant | null;
}

export interface LoadVideoSubtitleContent {
  video: LoadVideoSubtitleContent_video;
}

export interface LoadVideoSubtitleContentVariables {
  videoId: string;
  languageId: string;
}
