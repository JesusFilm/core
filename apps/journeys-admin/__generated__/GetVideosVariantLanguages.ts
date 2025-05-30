/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideosVariantLanguages
// ====================================================

export interface GetVideosVariantLanguages_videos_variants_language {
  __typename: "Language";
  id: string;
}

export interface GetVideosVariantLanguages_videos_variants {
  __typename: "VideoVariant";
  language: GetVideosVariantLanguages_videos_variants_language;
}

export interface GetVideosVariantLanguages_videos {
  __typename: "Video";
  variants: GetVideosVariantLanguages_videos_variants[];
}

export interface GetVideosVariantLanguages {
  videos: GetVideosVariantLanguages_videos[];
}

export interface GetVideosVariantLanguagesVariables {
  ids?: string[] | null;
}
