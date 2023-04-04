/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoVariantLanguages
// ====================================================

export interface GetVideoVariantLanguages_video_variantLanguages_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoVariantLanguages_video_variantLanguages {
  __typename: "Language";
  id: string;
  name: GetVideoVariantLanguages_video_variantLanguages_name[];
}

export interface GetVideoVariantLanguages_video {
  __typename: "Video";
  id: string;
  variantLanguages: GetVideoVariantLanguages_video_variantLanguages[];
}

export interface GetVideoVariantLanguages {
  video: GetVideoVariantLanguages_video | null;
}

export interface GetVideoVariantLanguagesVariables {
  id: string;
}
