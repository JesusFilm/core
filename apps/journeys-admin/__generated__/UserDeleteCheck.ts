/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserDeleteIdType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserDeleteCheck
// ====================================================

export interface UserDeleteCheck_userDeleteCheck_logs {
  __typename: "UserDeleteLogEntry";
  message: string;
  level: string;
  timestamp: string;
}

export interface UserDeleteCheck_userDeleteCheck {
  __typename: "UserDeleteCheckResult";
  userId: string;
  userEmail: string | null;
  userFirstName: string;
  journeysToDelete: number;
  journeysToTransfer: number;
  journeysToRemove: number;
  teamsToDelete: number;
  teamsToTransfer: number;
  teamsToRemove: number;
  logs: UserDeleteCheck_userDeleteCheck_logs[];
}

export interface UserDeleteCheck {
  userDeleteCheck: UserDeleteCheck_userDeleteCheck;
}

export interface UserDeleteCheckVariables {
  idType: UserDeleteIdType;
  id: string;
}
