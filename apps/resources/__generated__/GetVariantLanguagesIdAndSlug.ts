/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVariantLanguagesIdAndSlug
// ====================================================

export interface GetVariantLanguagesIdAndSlug_video_variantLanguages {
  __typename: "Language";
  id: string;
  slug: string | null;
}

export interface GetVariantLanguagesIdAndSlug_video_subtitles {
  __typename: "VideoSubtitle";
  languageId: string;
}

export interface GetVariantLanguagesIdAndSlug_video {
  __typename: "Video";
  variantLanguages: GetVariantLanguagesIdAndSlug_video_variantLanguages[];
  subtitles: GetVariantLanguagesIdAndSlug_video_subtitles[];
}

export interface GetVariantLanguagesIdAndSlug {
  video: GetVariantLanguagesIdAndSlug_video;
}

export interface GetVariantLanguagesIdAndSlugVariables {
  id: string;
}
