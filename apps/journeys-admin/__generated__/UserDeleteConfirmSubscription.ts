/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserDeleteIdType, USER_DELETE_LOG_LEVEL } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: UserDeleteConfirmSubscription
// ====================================================

export interface UserDeleteConfirmSubscription_userDeleteConfirm_log {
  __typename: "UserDeleteLogEntry";
  message: string;
  level: USER_DELETE_LOG_LEVEL;
  timestamp: string;
}

export interface UserDeleteConfirmSubscription_userDeleteConfirm {
  __typename: "UserDeleteConfirmProgress";
  log: UserDeleteConfirmSubscription_userDeleteConfirm_log;
  done: boolean;
  success: boolean | null;
}

export interface UserDeleteConfirmSubscription {
  userDeleteConfirm: UserDeleteConfirmSubscription_userDeleteConfirm;
}

export interface UserDeleteConfirmSubscriptionVariables {
  idType: UserDeleteIdType;
  id: string;
  deletedJourneyIds: string[];
  deletedTeamIds: string[];
  deletedUserJourneyIds: string[];
  deletedUserTeamIds: string[];
}
