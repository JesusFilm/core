/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserDeleteIdType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserDeleteConfirm
// ====================================================

export interface UserDeleteConfirm_userDeleteConfirm_logs {
  __typename: "UserDeleteLogEntry";
  message: string;
  level: string;
  timestamp: string;
}

export interface UserDeleteConfirm_userDeleteConfirm {
  __typename: "UserDeleteResult";
  success: boolean;
  logs: UserDeleteConfirm_userDeleteConfirm_logs[];
}

export interface UserDeleteConfirm {
  userDeleteConfirm: UserDeleteConfirm_userDeleteConfirm;
}

export interface UserDeleteConfirmVariables {
  idType: UserDeleteIdType;
  id: string;
}
