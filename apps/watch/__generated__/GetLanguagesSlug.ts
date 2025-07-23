/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguagesSlug
// ====================================================

export interface GetLanguagesSlug_video_variantLanguagesWithSlug_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetLanguagesSlug_video_variantLanguagesWithSlug_language {
  __typename: "Language";
  id: string;
  slug: string | null;
  name: GetLanguagesSlug_video_variantLanguagesWithSlug_language_name[];
}

export interface GetLanguagesSlug_video_variantLanguagesWithSlug {
  __typename: "LanguageWithSlug";
  slug: string;
  language: GetLanguagesSlug_video_variantLanguagesWithSlug_language;
}

export interface GetLanguagesSlug_video {
  __typename: "Video";
  variantLanguagesWithSlug: GetLanguagesSlug_video_variantLanguagesWithSlug[];
}

export interface GetLanguagesSlug {
  video: GetLanguagesSlug_video;
}

export interface GetLanguagesSlugVariables {
  id: string;
}
