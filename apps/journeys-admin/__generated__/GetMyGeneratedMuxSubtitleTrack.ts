/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMyGeneratedMuxSubtitleTrack
// ====================================================

export interface GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack_QueryGetMyGeneratedMuxSubtitleTrackSuccess_data {
  __typename: "MuxSubtitleTrack";
  id: string;
  status: string;
}

export interface GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack_QueryGetMyGeneratedMuxSubtitleTrackSuccess {
  __typename: "QueryGetMyGeneratedMuxSubtitleTrackSuccess";
  data: GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack_QueryGetMyGeneratedMuxSubtitleTrackSuccess_data;
}

export interface GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack_Error {
  __typename: "Error";
  message: string | null;
}

export type GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack = GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack_QueryGetMyGeneratedMuxSubtitleTrackSuccess | GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack_Error;

export interface GetMyGeneratedMuxSubtitleTrack {
  getMyGeneratedMuxSubtitleTrack: GetMyGeneratedMuxSubtitleTrack_getMyGeneratedMuxSubtitleTrack;
}

export interface GetMyGeneratedMuxSubtitleTrackVariables {
  muxVideoId: string;
  bcp47: string;
}
