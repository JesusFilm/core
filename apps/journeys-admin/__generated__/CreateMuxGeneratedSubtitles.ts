/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateMuxGeneratedSubtitles
// ====================================================

export interface CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess_data {
  __typename: "MuxSubtitleTrack";
  id: string;
  trackId: string | null;
  languageCode: string | null;
  muxLanguageName: string | null;
  readyToStream: boolean;
  source: string | null;
}

export interface CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess {
  __typename: "MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess";
  data: CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess_data;
}

export interface CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_Error {
  __typename: "Error";
  message: string | null;
}

export interface CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_ZodError_fieldErrors {
  __typename: "ZodFieldError";
  message: string;
  path: string[];
}

export interface CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_ZodError {
  __typename: "ZodError";
  message: string | null;
  fieldErrors: CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_ZodError_fieldErrors[];
}

export type CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId = CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess | CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_Error | CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId_ZodError;

export interface CreateMuxGeneratedSubtitles {
  createMuxGeneratedSubtitlesByAssetId: CreateMuxGeneratedSubtitles_createMuxGeneratedSubtitlesByAssetId;
}

export interface CreateMuxGeneratedSubtitlesVariables {
  assetId: string;
  languageCode: string;
  name: string;
  userGenerated?: boolean | null;
}
