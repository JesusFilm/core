/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetYouTubeClosedCaptionLanguageIds
// ====================================================

export interface GetYouTubeClosedCaptionLanguageIds_getYouTubeClosedCaptionLanguageIds_name {
  __typename: "YouTubeLanguageName";
  value: string | null;
  primary: boolean | null;
}

export interface GetYouTubeClosedCaptionLanguageIds_getYouTubeClosedCaptionLanguageIds {
  __typename: "YouTubeLanguage";
  id: string | null;
  bcp47: string | null;
  name: GetYouTubeClosedCaptionLanguageIds_getYouTubeClosedCaptionLanguageIds_name[] | null;
}

export interface GetYouTubeClosedCaptionLanguageIds {
  getYouTubeClosedCaptionLanguageIds: GetYouTubeClosedCaptionLanguageIds_getYouTubeClosedCaptionLanguageIds[];
}

export interface GetYouTubeClosedCaptionLanguageIdsVariables {
  videoId: string;
}
