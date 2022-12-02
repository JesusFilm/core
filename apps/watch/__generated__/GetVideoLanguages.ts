/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoLanguages
// ====================================================

export interface GetVideoLanguages_video_slug {
  __typename: "Translation";
  value: string;
}

export interface GetVideoLanguages_video_variant_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoLanguages_video_variant_language {
  __typename: "Language";
  name: GetVideoLanguages_video_variant_language_name[];
}

export interface GetVideoLanguages_video_variant {
  __typename: "VideoVariant";
  id: string;
  language: GetVideoLanguages_video_variant_language;
}

export interface GetVideoLanguages_video_variantLanguages_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoLanguages_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetVideoLanguages_video_variantLanguages_name[];
}

export interface GetVideoLanguages_video {
  __typename: "Video";
  id: string;
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideoLanguages_video_slug[];
  variant: GetVideoLanguages_video_variant | null;
  variantLanguages: GetVideoLanguages_video_variantLanguages[];
}

export interface GetVideoLanguages {
  video: GetVideoLanguages_video;
}

export interface GetVideoLanguagesVariables {
  id: string;
  languageId: string;
}
