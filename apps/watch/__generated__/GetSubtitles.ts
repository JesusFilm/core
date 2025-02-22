/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSubtitles
// ====================================================

export interface GetSubtitles_video_variant_subtitle_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetSubtitles_video_variant_subtitle_language {
  __typename: "Language";
  name: GetSubtitles_video_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface GetSubtitles_video_variant_subtitle {
  __typename: "VideoSubtitle";
  language: GetSubtitles_video_variant_subtitle_language;
  value: string;
}

export interface GetSubtitles_video_variant {
  __typename: "VideoVariant";
  subtitle: GetSubtitles_video_variant_subtitle[];
}

export interface GetSubtitles_video {
  __typename: "Video";
  variant: GetSubtitles_video_variant | null;
}

export interface GetSubtitles {
  video: GetSubtitles_video;
}

export interface GetSubtitlesVariables {
  id: string;
}
