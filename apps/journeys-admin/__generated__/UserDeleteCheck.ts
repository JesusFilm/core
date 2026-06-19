/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserDeleteIdType, USER_DELETE_LOG_LEVEL } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserDeleteCheck
// ====================================================

export interface UserDeleteCheck_userDeleteCheck_logs {
  __typename: "UserDeleteLogEntry";
  message: string;
  level: USER_DELETE_LOG_LEVEL;
  timestamp: string;
}

export interface UserDeleteCheck_userDeleteCheck {
  __typename: "UserDeleteCheckResult";
  userId: string;
  userEmail: string | null;
  userFirstName: string;
  logs: UserDeleteCheck_userDeleteCheck_logs[];
}

export interface UserDeleteCheck {
  userDeleteCheck: UserDeleteCheck_userDeleteCheck;
}

export interface UserDeleteCheckVariables {
  idType: UserDeleteIdType;
  id: string;
}
