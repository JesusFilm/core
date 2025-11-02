/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMuxSubtitleTrack
// ====================================================

export interface GetMuxSubtitleTrack_getMyMuxSubtitleTrack_QueryGetMyMuxSubtitleTrackSuccess_data {
  __typename: "MuxSubtitleTrack";
  id: string;
  trackId: string | null;
  languageCode: string | null;
  muxLanguageName: string | null;
  readyToStream: boolean;
  source: string | null;
}

export interface GetMuxSubtitleTrack_getMyMuxSubtitleTrack_QueryGetMyMuxSubtitleTrackSuccess {
  __typename: "QueryGetMyMuxSubtitleTrackSuccess";
  data: GetMuxSubtitleTrack_getMyMuxSubtitleTrack_QueryGetMyMuxSubtitleTrackSuccess_data;
}

export interface GetMuxSubtitleTrack_getMyMuxSubtitleTrack_Error {
  __typename: "Error";
  message: string | null;
}

export type GetMuxSubtitleTrack_getMyMuxSubtitleTrack = GetMuxSubtitleTrack_getMyMuxSubtitleTrack_QueryGetMyMuxSubtitleTrackSuccess | GetMuxSubtitleTrack_getMyMuxSubtitleTrack_Error;

export interface GetMuxSubtitleTrack {
  getMyMuxSubtitleTrack: GetMuxSubtitleTrack_getMyMuxSubtitleTrack;
}

export interface GetMuxSubtitleTrackVariables {
  id: string;
  userGenerated?: boolean | null;
}
