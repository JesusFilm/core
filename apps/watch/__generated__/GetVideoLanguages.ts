/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoLanguages
// ====================================================

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

export interface GetVideoLanguages_video_variantLanguagesWithSlug_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoLanguages_video_variantLanguagesWithSlug_language {
  __typename: "Language";
  id: string;
  name: GetVideoLanguages_video_variantLanguagesWithSlug_language_name[];
}

export interface GetVideoLanguages_video_variantLanguagesWithSlug {
  __typename: "LanguageWithSlug";
  slug: string | null;
  language: GetVideoLanguages_video_variantLanguagesWithSlug_language | null;
}

export interface GetVideoLanguages_video {
  __typename: "Video";
  id: string;
  variant: GetVideoLanguages_video_variant | null;
  variantLanguagesWithSlug: GetVideoLanguages_video_variantLanguagesWithSlug[];
}

export interface GetVideoLanguages {
  video: GetVideoLanguages_video | null;
}

export interface GetVideoLanguagesVariables {
  id: string;
}
