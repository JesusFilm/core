/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: YouTubeClosedCaptionLanguages
// ====================================================

export interface YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_Error {
  __typename: "Error" | "ZodError";
}

export interface YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data_name[];
}

export interface YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess {
  __typename: "QueryYoutubeClosedCaptionLanguagesSuccess";
  data: YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess_data[];
}

export type YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages = YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_Error | YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages_QueryYoutubeClosedCaptionLanguagesSuccess;

export interface YouTubeClosedCaptionLanguages {
  youtubeClosedCaptionLanguages: YouTubeClosedCaptionLanguages_youtubeClosedCaptionLanguages;
}

export interface YouTubeClosedCaptionLanguagesVariables {
  videoId: string;
}
