/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideosVariantLanguages
// ====================================================

export interface GetVideosVariantLanguages_videos_variant {
  __typename: "VideoVariant";
  id: string;
}

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
  id: string;
  variant: GetVideosVariantLanguages_videos_variant | null;
  variants: GetVideosVariantLanguages_videos_variants[];
}

export interface GetVideosVariantLanguages {
  videos: GetVideosVariantLanguages_videos[];
}

export interface GetVideosVariantLanguagesVariables {
  ids?: string[] | null;
}
