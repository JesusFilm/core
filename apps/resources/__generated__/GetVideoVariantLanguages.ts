/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoVariantLanguages
// ====================================================

export interface GetVideoVariantLanguages_video_variantLanguagesWithSlug_language {
  __typename: "Language";
  id: string;
}

export interface GetVideoVariantLanguages_video_variantLanguagesWithSlug {
  __typename: "LanguageWithSlug";
  slug: string;
  language: GetVideoVariantLanguages_video_variantLanguagesWithSlug_language;
}

export interface GetVideoVariantLanguages_video {
  __typename: "Video";
  id: string;
  variantLanguagesWithSlug: GetVideoVariantLanguages_video_variantLanguagesWithSlug[];
}

export interface GetVideoVariantLanguages {
  video: GetVideoVariantLanguages_video;
}

export interface GetVideoVariantLanguagesVariables {
  slug: string;
}
