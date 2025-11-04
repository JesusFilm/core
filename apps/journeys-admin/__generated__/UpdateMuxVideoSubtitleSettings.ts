/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateMuxVideoSubtitleSettings
// ====================================================

export interface UpdateMuxVideoSubtitleSettings_updateMuxVideoSubtitleSettings {
  __typename: "MuxVideo";
  id: string;
  showGeneratedSubtitles: boolean | null;
}

export interface UpdateMuxVideoSubtitleSettings {
  updateMuxVideoSubtitleSettings: UpdateMuxVideoSubtitleSettings_updateMuxVideoSubtitleSettings;
}

export interface UpdateMuxVideoSubtitleSettingsVariables {
  id: string;
  showGeneratedSubtitles: boolean;
}
