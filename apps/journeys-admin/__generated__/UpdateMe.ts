/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateMeInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateMe
// ====================================================

export interface UpdateMe_updateMe {
  __typename: "AuthenticatedUser";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

export interface UpdateMe {
  /**
   * Updates the current user's firstName, lastName, and email. Only callable by anonymous users.
   */
  updateMe: UpdateMe_updateMe | null;
}

export interface UpdateMeVariables {
  input: UpdateMeInput;
}
