/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguagesSlug
// ====================================================

export interface GetLanguagesSlug_video_variantLanguagesWithSlug_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetLanguagesSlug_video_variantLanguagesWithSlug_language {
  __typename: "Language";
  id: string;
  name: GetLanguagesSlug_video_variantLanguagesWithSlug_language_name[];
}

export interface GetLanguagesSlug_video_variantLanguagesWithSlug {
  __typename: "LanguageWithSlug";
  slug: string | null;
  language: GetLanguagesSlug_video_variantLanguagesWithSlug_language | null;
}

export interface GetLanguagesSlug_video {
  __typename: "Video";
  variantLanguagesWithSlug: GetLanguagesSlug_video_variantLanguagesWithSlug[];
}

export interface GetLanguagesSlug {
  video: GetLanguagesSlug_video | null;
}

export interface GetLanguagesSlugVariables {
  id: string;
}
