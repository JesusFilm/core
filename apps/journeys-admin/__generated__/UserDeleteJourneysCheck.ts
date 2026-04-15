/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserDeleteJourneysCheck
// ====================================================

export interface UserDeleteJourneysCheck_userDeleteJourneysCheck_logs {
  __typename: "UserDeleteJourneysLogEntry";
  message: string;
  level: string;
  timestamp: string;
}

export interface UserDeleteJourneysCheck_userDeleteJourneysCheck {
  __typename: "UserDeleteJourneysCheckResult";
  journeysToDelete: number;
  journeysToTransfer: number;
  journeysToRemove: number;
  teamsToDelete: number;
  teamsToTransfer: number;
  teamsToRemove: number;
  logs: UserDeleteJourneysCheck_userDeleteJourneysCheck_logs[];
}

export interface UserDeleteJourneysCheck {
  userDeleteJourneysCheck: UserDeleteJourneysCheck_userDeleteJourneysCheck;
}

export interface UserDeleteJourneysCheckVariables {
  userId: string;
}
