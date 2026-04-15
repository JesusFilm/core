/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserDeleteJourneysConfirm
// ====================================================

export interface UserDeleteJourneysConfirm_userDeleteJourneysConfirm_logs {
  __typename: "UserDeleteJourneysLogEntry";
  message: string;
  level: string;
  timestamp: string;
}

export interface UserDeleteJourneysConfirm_userDeleteJourneysConfirm {
  __typename: "UserDeleteJourneysConfirmResult";
  success: boolean;
  deletedJourneyIds: string[];
  deletedTeamIds: string[];
  deletedUserJourneyIds: string[];
  deletedUserTeamIds: string[];
  logs: UserDeleteJourneysConfirm_userDeleteJourneysConfirm_logs[];
}

export interface UserDeleteJourneysConfirm {
  userDeleteJourneysConfirm: UserDeleteJourneysConfirm_userDeleteJourneysConfirm;
}

export interface UserDeleteJourneysConfirmVariables {
  userId: string;
}
