/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum JourneyStatus {
  draft = "draft",
  published = "published",
}

export enum ThemeMode {
  dark = "dark",
  light = "light",
}

export enum ThemeName {
  base = "base",
}

export enum UserJourneyRole {
  editor = "editor",
  inviteRequested = "inviteRequested",
  owner = "owner",
}

export enum UserJourneyRoleForUpdates {
  editor = "editor",
  inviteRequested = "inviteRequested",
}

export interface UserCreateInput {
  email?: string | null;
  firstName?: string | null;
  id?: string | null;
  imageUrl?: string | null;
  lastName?: string | null;
}

export interface UserJourneyRemoveInput {
  journeyId: string;
  role: UserJourneyRoleForUpdates;
  userId: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
